/* eslint-disable no-redeclare */
'use strict'

import sodium from 'sodium-browserify-tweetnacl'
import crypto from 'crypto'
import nacl from 'tweetnacl/nacl-fast'
import ed2curve from 'ed2curve'
import { decode } from '@stablelib/utf8'
import bignum from './bignumber.js'
import ByteBuffer from 'bytebuffer'
import constants from './constants'
import { hexToBytes, bytesToHex } from './hex'
import cache from '@/store/cache'

/**
 * Crypto functions that implements sodium.
 * @memberof module:helpers
 * @requires sodium
 * @namespace
 */
const adamant = {}

/**
 * Converts provided `time` to Adamant's epoch timestamp
 * @param {number=} time timestamp to convert
 * @returns {number}
 */
adamant.epochTime = function (time) {
  if (!time) {
    time = Date.now()
  }

  return Math.floor((time - constants.EPOCH) / 1000)
}

/**
 * Converts ADM epoch timestamp to a Unix timestamp
 * @param {number} epochTime timestamp to convert
 * @returns {number}
 */
adamant.toTimestamp = function (epochTime) {
  return epochTime * 1000 + constants.EPOCH
}

/**
 * Replaced by uri.js
 * Parses URI, return false on fails or object with fields if valid
 * @param uri
 * @returns {*}
 */
/*
adamant.parseURIasAIP = function (uri) {
  const r = /^adm:(U[0-9]{17,22})(?:\?(.*))?$/
  const match = r.exec(uri)
  if (!match) {
    return false
  }
  const parsed = { url: uri }
  if (match[2]) {
    const queries = match[2].split('&')
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i].split('=')
      if (query.length === 2) {
        parsed[query[0]] = decodeURIComponent(query[1].replace(/\+/g, '%20'))
      }
    }
  }
  parsed.address = match[1]
  return parsed
}
*/

/**
 * Creates a hash based on a passphrase.
 * bip39.mnemonicToSeedSync is time consuming, so we use cached value, if possible
 * @param {string} passphrase
 * @return {string} hash
 */
adamant.createPassphraseHash = function (passphrase) {
  const seedHex = cache.mnemonicToSeedSync(passphrase).toString('hex')
  return crypto.createHash('sha256').update(seedHex, 'hex').digest()
}

/**
 * Creates a keypair based on a hash.
 * @implements {sodium}
 * @param {hash} hash
 * @return {Object} publicKey, privateKey
 */
adamant.makeKeypair = function (hash) {
  const keypair = sodium.crypto_sign_seed_keypair(hash)

  return {
    publicKey: keypair.publicKey,
    privateKey: keypair.secretKey
  }
}

/**
 * Calculates ADM address based on the public key specified
 * @param {any} publicKey public key to derive ADM address from
 * @returns {string}
 */
adamant.getAddressFromPublicKey = function (publicKey) {
  const publicKeyHash = crypto.createHash('sha256').update(publicKey, 'hex').digest()
  const temp = Buffer.alloc(8)

  for (let i = 0; i < 8; i++) {
    temp[i] = publicKeyHash[7 - i]
  }

  return 'U' + bignum.fromBuffer(temp).toString()
}

/**
 * Creates hash based on transaction bytes.
 * @implements {getBytes}
 * @implements {crypto.createHash}
 * @param {transaction} trs
 * @return {hash} sha256 crypto hash
 */
adamant.getHash = function (trs) {
  return crypto.createHash('sha256').update(this.getBytes(trs)).digest()
}

/**
 * Calls `getBytes` based on trs type (see privateTypes)
 * @see privateTypes
 * @implements {ByteBuffer}
 * @param {transaction} trs
 * @param {boolean} skipSignature
 * @param {boolean} skipSecondSignature
 * @return {!Array} Contents as an ArrayBuffer.
 * @throws {error} If buffer fails.
 */

adamant.getBytes = function (transaction) {
  const skipSignature = false
  const skipSecondSignature = true
  let assetSize = 0
  let assetBytes = null

  switch (transaction.type) {
    case constants.Transactions.SEND:
      break
    case constants.Transactions.CHAT_MESSAGE:
      assetBytes = this.chatGetBytes(transaction)
      assetSize = assetBytes.length
      break
    case constants.Transactions.STATE:
      assetBytes = this.stateGetBytes(transaction)
      assetSize = assetBytes.length
      break
    case constants.Transactions.DELEGATE:
      assetBytes = this.delegateGetBytes(transaction)
      assetSize = assetBytes.length
      break
    case constants.Transactions.VOTE:
      assetBytes = this.voteGetBytes(transaction)
      assetSize = assetBytes.length
      break
    default:
      alert('Not supported yet')
  }

  const bb = new ByteBuffer(1 + 4 + 32 + 8 + 8 + 64 + 64 + assetSize, true)

  bb.writeByte(transaction.type)
  bb.writeInt(transaction.timestamp)

  const senderPublicKeyBuffer = Buffer.from(transaction.senderPublicKey, 'hex')
  for (let i = 0; i < senderPublicKeyBuffer.length; i++) {
    bb.writeByte(senderPublicKeyBuffer[i])
  }

  if (transaction.requesterPublicKey) {
    const requesterPublicKey = Buffer.from(transaction.requesterPublicKey, 'hex')

    for (let i = 0; i < requesterPublicKey.length; i++) {
      bb.writeByte(requesterPublicKey[i])
    }
  }

  if (transaction.recipientId) {
    let recipient = transaction.recipientId.slice(1)
    // eslint-disable-next-line new-cap
    recipient = new bignum(recipient).toBuffer({ size: 8 })

    for (let i = 0; i < 8; i++) {
      bb.writeByte(recipient[i] || 0)
    }
  } else {
    for (let i = 0; i < 8; i++) {
      bb.writeByte(0)
    }
  }

  bb.writeLong(transaction.amount)

  if (assetSize > 0) {
    for (let i = 0; i < assetSize; i++) {
      bb.writeByte(assetBytes[i])
    }
  }

  if (!skipSignature && transaction.signature) {
    const signatureBuffer = Buffer.from(transaction.signature, 'hex')
    for (let i = 0; i < signatureBuffer.length; i++) {
      bb.writeByte(signatureBuffer[i])
    }
  }

  if (!skipSecondSignature && transaction.signSignature) {
    const signSignatureBuffer = Buffer.from(transaction.signSignature, 'hex')
    for (let i = 0; i < signSignatureBuffer.length; i++) {
      bb.writeByte(signSignatureBuffer[i])
    }
  }

  bb.flip()
  const arrayBuffer = new Uint8Array(bb.toArrayBuffer())
  const buffer = []

  for (let i = 0; i < arrayBuffer.length; i++) {
    buffer[i] = arrayBuffer[i]
  }

  return Buffer.from(buffer)
}

adamant.transactionSign = function (trs, keypair) {
  const hash = this.getHash(trs)
  return this.sign(hash, keypair).toString('hex')
}
adamant.chatGetBytes = function (trs) {
  let buf

  buf = Buffer.from([])
  const messageBuf = Buffer.from(trs.asset.chat.message, 'hex')
  buf = Buffer.concat([buf, messageBuf])

  if (trs.asset.chat.own_message) {
    const ownMessageBuf = Buffer.from(trs.asset.chat.own_message, 'hex')
    buf = Buffer.concat([buf, ownMessageBuf])
  }
  const bb = new ByteBuffer(4 + 4, true)
  bb.writeInt(trs.asset.chat.type)
  bb.flip()
  buf = Buffer.concat([buf, Buffer.from(bb.toBuffer())])

  return buf
}

adamant.delegateGetBytes = function (trs) {
  if (!trs.asset.delegate.username) {
    return null
  }
  let buf

  buf = Buffer.from(trs.asset.delegate.username, 'utf8')

  return buf
}

adamant.voteGetBytes = function (trs) {
  if (!trs.asset.votes || trs.asset.votes.length === 0) {
    return null
  }
  let buf

  buf = Buffer.from([])
  for (const i in trs.asset.votes) {
    buf = Buffer.concat([buf, Buffer.from(trs.asset.votes[i], 'utf8')])
  }
  return buf
}

adamant.stateGetBytes = function (trs) {
  if (!trs.asset.state.value) {
    return null
  }
  let buf

  buf = Buffer.from([])
  const stateBuf = Buffer.from(trs.asset.state.value)
  buf = Buffer.concat([buf, stateBuf])

  if (trs.asset.state.key) {
    const keyBuf = Buffer.from(trs.asset.state.key)
    buf = Buffer.concat([buf, keyBuf])
  }

  const bb = new ByteBuffer(4 + 4, true)
  bb.writeInt(trs.asset.state.type)
  bb.flip()

  buf = Buffer.concat([buf, Buffer.from(bb.toBuffer())])

  return buf
}

/**
 * Creates a signature based on a hash and a keypair.
 * @implements {sodium}
 * @param {hash} hash
 * @param {keypair} keypair
 * @return {signature} signature
 */
adamant.sign = function (hash, keypair) {
  return sodium.crypto_sign_detached(hash, Buffer.from(keypair.privateKey, 'hex'))
}

/**
 * Verifies a signature based on a hash and a publicKey.
 * @implements {sodium}
 * @param {hash} hash
 * @param {keypair} keypair
 * @return {Boolean} true id verified
 */
adamant.verify = function (hash, signatureBuffer, publicKeyBuffer) {
  return sodium.crypto_sign_verify_detached(signatureBuffer, hash, publicKeyBuffer)
}

/**
 * Encodes a text message for sending to ADM
 * @param {string} msg message to encode
 * @param {*} recipientPublicKey recipient's public key
 * @param {*} privateKey our private key
 * @returns {{message: string, nonce: string}}
 */
adamant.encodeMessage = function (msg, recipientPublicKey, privateKey) {
  const nonce = Buffer.allocUnsafe(24)
  sodium.randombytes(nonce)

  if (typeof recipientPublicKey === 'string') {
    recipientPublicKey = hexToBytes(recipientPublicKey)
  }

  const plainText = Buffer.from(msg)
  const DHPublicKey = ed2curve.convertPublicKey(recipientPublicKey)
  const DHSecretKey = ed2curve.convertSecretKey(privateKey)

  const encrypted = nacl.box(plainText, nonce, DHPublicKey, DHSecretKey)

  return {
    message: bytesToHex(encrypted),
    nonce: bytesToHex(nonce)
  }
}

/**
 * Decodes the incoming message
 * @param {any} msg encoded message
 * @param {string} senderPublicKey sender public key
 * @param {string} privateKey our private key
 * @param {any} nonce nonce
 * @returns {string}
 */
adamant.decodeMessage = function (msg, senderPublicKey, privateKey, nonce) {
  if (typeof msg === 'string') {
    msg = hexToBytes(msg)
  }

  if (typeof nonce === 'string') {
    nonce = hexToBytes(nonce)
  }

  if (typeof senderPublicKey === 'string') {
    senderPublicKey = hexToBytes(senderPublicKey)
  }

  if (typeof privateKey === 'string') {
    privateKey = hexToBytes(privateKey)
  }

  const DHPublicKey = ed2curve.convertPublicKey(senderPublicKey)
  const DHSecretKey = ed2curve.convertSecretKey(privateKey)
  const decrypted = nacl.box.open(msg, nonce, DHPublicKey, DHSecretKey)

  return decrypted ? decode(decrypted) : ''
}

/**
 * Encodes a secret value (available for the owner only)
 * @param {string} value value to encode
 * @param {Uint8Array} privateKey private key
 * @returns {{message: string, nonce: string}} encoded value and nonce (both as HEX-strings)
 */
adamant.encodeValue = function (value, privateKey) {
  const randomString = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, Math.ceil(Math.random() * 10))

  const nonce = Buffer.allocUnsafe(24)
  sodium.randombytes(nonce)

  // for some reason calling `JSON.stringify` directly breaks the module compilation.
  const padded = randomString() + JSON.stringify({ payload: value }) + randomString()

  const plainText = Buffer.from(padded)
  const secretKey = ed2curve.convertSecretKey(sodium.crypto_hash_sha256(privateKey))

  const encrypted = nacl.secretbox(plainText, nonce, secretKey)

  return {
    message: bytesToHex(encrypted),
    nonce: bytesToHex(nonce)
  }
}

/**
 * Decodes a secret value
 * @param {string|Uint8Array} source source to decrypt
 * @param {Uint8Array} privateKey private key
 * @param {string|Uint8Array} nonce nonce
 * @returns {string} decoded value
 */
adamant.decodeValue = function (source, privateKey, nonce) {
  if (typeof source === 'string') {
    source = hexToBytes(source)
  }

  if (typeof nonce === 'string') {
    nonce = hexToBytes(nonce)
  }

  const secretKey = ed2curve.convertSecretKey(sodium.crypto_hash_sha256(privateKey))
  const decrypted = nacl.secretbox.open(source, nonce, secretKey)

  const strValue = decrypted ? decode(decrypted) : ''
  if (!strValue) return null

  const from = strValue.indexOf('{')
  const to = strValue.lastIndexOf('}')

  if (from < 0 || to < 0) {
    throw new Error('Could not determine JSON boundaries in the encoded value')
  }

  const json = JSON.parse(strValue.substr(from, to - from + 1))
  return json.payload
}

/**
 * Encodes a secret binary (available for the owner only)
 * @param {Uint8Array} source value to encode
 * @param {Uint8Array} recipientPublicKey sender's public key
 * @param {Uint8Array|Buffer} privateKey private key
 * @returns {{binary: string, nonce: string}} encoded binary and nonce (both as HEX-strings)
 */
adamant.encodeBinary = function (source, recipientPublicKey, privateKey) {
  const nonce = Buffer.allocUnsafe(24)
  sodium.randombytes(nonce)

  const publicKey = hexToBytes(recipientPublicKey)

  const DHPublicKey = ed2curve.convertPublicKey(publicKey)
  const DHSecretKey = ed2curve.convertSecretKey(privateKey)

  const encrypted = nacl.box(source, nonce, DHPublicKey, DHSecretKey)

  return {
    binary: encrypted,
    nonce: bytesToHex(nonce)
  }
}

/**
 * Decodes a secret binary
 * @param {string|Uint8Array} source source to decrypt
 * @param {string|Uint8Array} senderPublicKey sender's public key
 * @param {Uint8Array|Buffer} privateKey private key
 * @param {string|Uint8Array} nonce nonce
 * @returns {string} decoded value
 */
adamant.decodeBinary = function (source, senderPublicKey, privateKey, nonce) {
  if (typeof nonce === 'string') {
    nonce = hexToBytes(nonce)
  }

  const publicKey =
    typeof senderPublicKey === 'string' ? hexToBytes(senderPublicKey) : senderPublicKey

  const DHPublicKey = ed2curve.convertPublicKey(publicKey)
  const DHSecretKey = ed2curve.convertSecretKey(privateKey)

  return nacl.box.open(source, nonce, DHPublicKey, DHSecretKey)
}

/**
 * Converts ADM amount to its internal representation
 * @param {number|string} admAmount amount to convert
 * @returns {number}
 */
adamant.prepareAmount = function (admAmount) {
  return Math.round(Number(admAmount) * 100000000)
}

adamant.toAdm = function (rawAmount) {
  return Number(rawAmount) / 100000000
}

export default adamant
