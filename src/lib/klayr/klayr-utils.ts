/**
 * Additional coin-based functions here
 */

import { CryptoSymbol } from '@/lib/constants/cryptos'
import { TRANSACTION_PARAMS_SCHEMA, TRANSACTION_SCHEMA } from '@/lib/klayr/klayr-schemas'
import { DecodedTransaction, Transaction } from './types/klayr'
import { codec } from '@klayr/codec'
import * as cryptography from '@klayr/cryptography'
import networks from '@/lib/klayr/networks'
import { convertBeddowsTokly } from '@klayr/transactions'
import * as transactions from '@klayr/transactions'
import { Buffer } from 'buffer'
import pbkdf2 from 'pbkdf2'
import sodium from 'sodium-browserify-tweetnacl'
import {
  KlayrHashSettings,
  KLY_CHAIN_ID,
  KLY_TRANSFER_TO_NEW_ACCOUNT_FEE,
  KLY_DECIMALS,
  KLY_DEMO_ACCOUNT,
  KLY_TOKEN_ID,
  KLY_MIN_FEE_PER_BYTE
} from './klayr-constants'
import { bytesToHex, hexToBytes } from '@/lib/hex'
import * as validator from '@klayr/validator'

/**
 * Returns Millis timestamp by KLY UNIX timestamp (sec)
 * @param {number} timestamp
 */
export function getMillisTimestamp(timestamp: number | string) {
  return parseInt(timestamp.toString()) * 1000
}

/**
 * Returns KLY timestamp (UNIX in sec) by Millis timestamp
 * @param {number} millisTimestamp
 */
export function getKlayrTimestamp(millisTimestamp: number | string) {
  return Math.round(parseInt(millisTimestamp.toString()) / 1000) // may be a mistake (use Math.floor instead)
}

export function getAccount(crypto: CryptoSymbol, passphrase: string) {
  const network = networks[crypto]
  const klayrSeed = pbkdf2.pbkdf2Sync(
    passphrase,
    KlayrHashSettings.SALT,
    KlayrHashSettings.ITERATIONS,
    KlayrHashSettings.KEYLEN,
    KlayrHashSettings.DIGEST
  )
  const keyPair = sodium.crypto_sign_seed_keypair(klayrSeed)
  const addressHexBinary = cryptography.address.getAddressFromPublicKey(keyPair.publicKey)
  const addressHex = bytesToHex(addressHexBinary)
  const address = cryptography.address.getKlayr32AddressFromPublicKey(keyPair.publicKey)
  // Don't work currently https://github.com/LiskHQ/lisk-sdk/issues/6651
  // const addressLegacy = cryptography.getLegacyAddressFromPublicKey(keyPair.publicKey)
  // const addressLegacy = cryptography.getLegacyAddressFromPrivateKey(keyPair.secretKey)
  const addressLegacy = 'cryptography.getLegacyAddressFromPublicKey(bytesToHex(keyPair.publicKey))'
  return {
    network,
    keyPair,
    address,
    addressHexBinary,
    addressHex,
    addressLegacy
  }
}

export function seedKlyAccount(passphrase: string) {
  const klayrSeed = pbkdf2.pbkdf2Sync(
    passphrase,
    KlayrHashSettings.SALT,
    KlayrHashSettings.ITERATIONS,
    KlayrHashSettings.KEYLEN,
    KlayrHashSettings.DIGEST
  )
  const keyPair = sodium.crypto_sign_seed_keypair(klayrSeed)

  const address = cryptography.address.getKlayr32AddressFromPublicKey(keyPair.publicKey)
  const addressHexBinary = cryptography.address.getAddressFromPublicKey(keyPair.publicKey)
  const addressHex = bytesToHex(addressHexBinary)

  return {
    keyPair,
    address,
    addressHexBinary,
    addressHex
  }
}

/**
 * Create and sign a transfer transaction.
 * Transaction `hex` result is ready for broadcasting to blockchain network.
 *
 * @param keyPair Sender's `publicKey` and `privateKey`
 * @param address Receiver address in Klayr32 format
 * @param amount Amount to transfer (KLY, not Beddows)
 * @param fee Transaction fee (KLY, not Beddows)
 * @param nonce Transaction nonce
 * @param data Transaction data field
 */
export function createTransaction(
  keyPair: { publicKey: Buffer; secretKey: Buffer },
  address: string,
  amount: number | string,
  fee: number | string,
  nonce: number | string,
  data = ''
) {
  const unsignedTransaction = createUnsignedTransaction(
    address,
    Buffer.from(keyPair.publicKey.buffer).toString('hex'),
    amount,
    fee,
    nonce,
    data
  )

  const signedTransaction = transactions.signTransaction(
    unsignedTransaction,
    Buffer.from(KLY_CHAIN_ID, 'hex'),
    keyPair.secretKey,
    TRANSACTION_PARAMS_SCHEMA
  ) as unknown as Transaction

  const id = bytesToHex(signedTransaction.id)

  return { hex: encodeTransaction(signedTransaction), id }
}

/**
 * Creates unsigned KLY transaction.
 *
 * @param recipientAddress Recipient address (Klayr32 string hex format)
 * @param senderPublicKey Sender public key (string hex)
 * @param amount Amount of KLY to send
 * @param fee Transaction fee
 * @param nonce Last nonce
 * @param data A.k.a note
 */
export function createUnsignedTransaction(
  recipientAddress: string,
  senderPublicKey: string,
  amount: number | string,
  fee: number | string,
  nonce: number | string,
  data = ''
) {
  const amountString = transactions.convertklyToBeddows((+amount).toFixed(KLY_DECIMALS))
  const feeString = transactions.convertklyToBeddows((+fee).toFixed(KLY_DECIMALS))
  const nonceString = nonce.toString()

  // Adjust the values of the unsigned transaction manually
  const unsignedTransaction = {
    module: 'token',
    command: 'transfer',
    fee: BigInt(feeString),
    nonce: BigInt(nonceString),
    senderPublicKey: Buffer.from(senderPublicKey, 'hex'),
    params: Buffer.alloc(0) as unknown, // must be Buffer when passing to `validator.validate()` and then overridden with an object
    signatures: []
  }

  validator.validator.validate(TRANSACTION_SCHEMA, unsignedTransaction)

  // Create the asset for the Token Transfer transaction
  const transferParams = {
    tokenID: Buffer.from(KLY_TOKEN_ID, 'hex'),
    amount: BigInt(amountString),
    recipientAddress: cryptography.address.getAddressFromKlayr32Address(recipientAddress),
    data
  }

  // Add the transaction params to the transaction object
  unsignedTransaction.params = transferParams

  // Only `transaction.params` will be validated
  transactions.validateTransaction(unsignedTransaction, TRANSACTION_PARAMS_SCHEMA)

  return unsignedTransaction
}

/**
 * Encode transaction for later broadcasting to a node.
 */
export function encodeTransaction(transaction: DecodedTransaction | Transaction) {
  let encodedParams
  if (!Buffer.isBuffer(transaction.params)) {
    encodedParams = codec.encode(TRANSACTION_PARAMS_SCHEMA, transaction.params)
  } else {
    encodedParams = transaction.params
  }

  const encodedTransaction = codec.encode(TRANSACTION_SCHEMA, {
    ...transaction,
    params: encodedParams
  })

  return encodedTransaction.toString('hex')
}

type EstimateFeeParams = {
  /**
   * KLY amount
   */
  amount?: string | number
  /**
   * Sender's `publicKey` and `privateKey`
   */
  keyPair?: { publicKey: string; secretKey: string }
  /**
   * Recipient address in Klayr32 format
   */
  recipientAddress?: string
  /**
   * Transaction data field
   */
  data?: string
  isNewAccount?: boolean
  /**
   * Current nonce
   */
  nonce?: number | string
}

/**
 * Estimate transaction fee by KLY amount.
 * https://klayr.xyz/documentation/understand-blockchain/blocks-txs.html#transaction-fees
 *
 * @param params Transaction params
 */
export function estimateFee(params?: EstimateFeeParams) {
  const {
    amount = '1',
    keyPair = KLY_DEMO_ACCOUNT.keyPair,
    recipientAddress = KLY_DEMO_ACCOUNT.address,
    data = '',
    nonce = 0,
    isNewAccount
  } = params || {}

  const transaction = createTransaction(
    {
      publicKey: Buffer.from(keyPair.publicKey, 'hex'),
      secretKey: Buffer.from(keyPair.secretKey, 'hex')
    },
    recipientAddress,
    amount,
    1,
    nonce,
    data
  )
  const transactionBytes = hexToBytes(transaction.hex)

  const fee = BigInt(transactionBytes.length) * KLY_MIN_FEE_PER_BYTE
  const transferToNewAccountFee = isNewAccount ? KLY_TRANSFER_TO_NEW_ACCOUNT_FEE : BigInt(0)

  const totalFee = fee + transferToNewAccountFee

  return convertBeddowsTokly(totalFee.toString())
}
