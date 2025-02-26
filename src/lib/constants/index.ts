import {
  AllCryptos,
  AllCryptosOrder,
  Cryptos,
  CryptosInfo,
  CryptosOrder,
  CryptoSymbol
} from './cryptos'

import { mdiCheck, mdiClockOutline, mdiCloseCircleOutline, mdiAlertOutline, mdiHelpCircleOutline } from '@mdi/js'


export const EPOCH = Date.UTC(2017, 8, 2, 17, 0, 0, 0)

export const Transactions = {
  SEND: 0,
  SIGNATURE: 1,
  DELEGATE: 2,
  VOTE: 3,
  MULTI: 4,
  DAPP: 5,
  IN_TRANSFER: 6,
  OUT_TRANSFER: 7,
  CHAT_MESSAGE: 8,
  STATE: 9
} as const

/**
 * @see https://github.com/Adamant-im/adamant/wiki/Message-Types
 */
export const MessageType = {
  BASIC_ENCRYPTED_MESSAGE: 1,
  RICH_CONTENT_MESSAGE: 2,
  SIGNAL_MESSAGE: 3,
  cryptoTransferMessage: (cryptoSymbol: string) => `${cryptoSymbol.toLowerCase()}_transaction`
} as const

export type FiatCurrencySymbol = 'USD' | 'EUR' | 'RUB' | 'CNY' | 'JPY'

export const Rates: Record<FiatCurrencySymbol, FiatCurrencySymbol> = {
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
  CNY: 'CNY',
  JPY: 'JPY'
}

export const RatesNames: Record<FiatCurrencySymbol, string> = {
  USD: 'USD ($)', // United States Dollar
  EUR: 'EUR (€)', // Euro
  RUB: 'RUB (₽)', // Russian Ruble
  CNY: 'CNY (¥)', // Chinese Yuan
  JPY: 'JPY (¥)' // Japanese Yen
}

export const UPLOAD_MAX_FILE_COUNT = 5
export const UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/** Fees for the misc ADM operations */
export const Fees = {
  /** Storing a value into the KVS */
  KVS: 0.001,
  /** Transferring tokens */
  ADM_TRANSFER: 0.5,
  NOT_ADM_TRANSFER: 0.001
}

/** Regex for detecting of base64 encoded string */
export const base64regex =
  /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

export const Symbols = {
  CLOCK: String.fromCharCode(0x23f0), // ⏰
  HOURGLASS: String.fromCharCode(0x23f3), // ⏳
  CROSS: String.fromCharCode(0x274c) // ❌
}

export const Delegates = {
  ACTIVE_DELEGATES: 101
}

export const WelcomeMessage = {
  ADAMANT_BOUNTY: 'ADAMANT Bounty',
  ADAMANT_ICO: 'ADAMANT Tokens'
}

export const BTC_BASED = Object.freeze([Cryptos.DOGE, Cryptos.DASH, Cryptos.BTC])
export const KLY_BASED = Object.freeze([Cryptos.KLY])
export const INSTANT_SEND = Object.freeze([Cryptos.DASH])
export const ALLOW_TEXT_DATA = Object.freeze([Cryptos.KLY]) // Some blockchains allow storing a text message within a Tx

export const isErc20 = (crypto: CryptoSymbol) => CryptosInfo[crypto]?.type === 'ERC20'
export const isEthBased = (crypto: CryptoSymbol) => isErc20(crypto) || crypto === Cryptos.ETH
export const isFeeEstimate = (crypto: CryptoSymbol) => isEthBased(crypto)
export const isBtcBased = (crypto: CryptoSymbol) => BTC_BASED.includes(crypto)
export const isKlyBased = (crypto: CryptoSymbol) => KLY_BASED.includes(crypto)
export const isSelfTxAllowed = (crypto: CryptoSymbol) =>
  KLY_BASED.includes(crypto) || crypto === Cryptos.ADM
export const isInstantSendPossible = (crypto: CryptoSymbol) => INSTANT_SEND.includes(crypto)
export const isTextDataAllowed = (crypto: CryptoSymbol) => ALLOW_TEXT_DATA.includes(crypto)

export const RE_KLY_ADDRESS_LEGACY = /^[0-9]{2,21}L$/

/**
 * These gas limit values are used only for estimate fees for ETH & ERC-20 transfers in the Send tokens form,
 * Actual gas limit values are calculated with estimateGas(transactionObject)
 * when each specific transaction is created
 */

/** Gas limit value for the ETH transfers */
export const DEFAULT_ETH_TRANSFER_GAS_LIMIT = (CryptosInfo['ETH'] as any).defaultGasLimit // @todo fix type in adamant-wallets
/** Gas limit value for the ERC-20 transfers */
export const DEFAULT_ERC20_TRANSFER_GAS_LIMIT = DEFAULT_ETH_TRANSFER_GAS_LIMIT * 2.4

/** Increase fee multiplier. Used as a checkbox on SendFundsForm */
export const INCREASE_FEE_MULTIPLIER = 1.5

export { AllCryptos, AllCryptosOrder, Cryptos, CryptosInfo, CryptosOrder, type CryptoSymbol }

export default {
  EPOCH,
  Transactions
}

export const UserPasswordArticleLink =
  'https://medium.com/adamant-im/more-convenience-login-to-the-web-messenger-with-user-password-9d48a736dfd8'

export const UserPasswordHashSettings = {
  SALT: 'salt',
  ITERATIONS: 100000,
  KEYLEN: 64,
  DIGEST: 'sha512'
}

export type TransactionStatusType =
  | 'CONFIRMED'
  | 'PENDING'
  | 'REGISTERED'
  | 'REJECTED'
  | 'INVALID'
  | 'UNKNOWN'

/** Status of ADM or coin transaction */
export const TransactionStatus: Record<TransactionStatusType, TransactionStatusType> = {
  CONFIRMED: 'CONFIRMED', // Tx has at least 1 network confirmation
  PENDING: 'PENDING', // We don't know about this Tx anything yet, it may not exist in a blockchain
  REGISTERED: 'REGISTERED', // This Ts is seen on a blockchain, but has 0 confirmations yet
  REJECTED: 'REJECTED', // We unable to find this Tx in a blockchain, or it says it was rejected
  INVALID: 'INVALID', // Wrong sender, recipient, time or amount
  UNKNOWN: 'UNKNOWN' // We don't recognize a cryptocurrency
}

/** Additional status of ADM or coin transaction, which leads to new virtualStatus */
export const TransactionAdditionalStatus = {
  NONE: false,
  INSTANT_SEND: 'instant_send', // Dash InstantSend enabled transaction
  ADM_REGISTERED: 'adm_registered' // ADM tx, registered in a blockchain, but has 0 confirmations yet
}

export const tsIcon = function (status: TransactionStatusType) {
  if (status === TransactionStatus.CONFIRMED) {
    return mdiCheck
  }

  if (status === TransactionStatus.PENDING || status === TransactionStatus.REGISTERED) {
    return mdiClockOutline
  }

  if (status === TransactionStatus.REJECTED) {
    return mdiCloseCircleOutline
  }

  if (status === TransactionStatus.INVALID) {
    return mdiAlertOutline
  }

  if (status === TransactionStatus.UNKNOWN) {
    return mdiHelpCircleOutline
  }
}

export const tsColor = function (status: TransactionStatusType) {
  if (status === TransactionStatus.REJECTED) {
    return 'red'
  } else if (status === TransactionStatus.INVALID || status === TransactionStatus.UNKNOWN) {
    return 'yellow'
  }
  return ''
}

export const tsUpdatable = function (status: TransactionStatusType, currency: CryptoSymbol) {
  currency = currency.toUpperCase() as CryptoSymbol

  if (currency === Cryptos.ADM) {
    return false
  } else if (status === TransactionStatus.CONFIRMED) {
    return true
  } else if (status === TransactionStatus.PENDING || status === TransactionStatus.REGISTERED) {
    return false
  } else if (status === TransactionStatus.REJECTED) {
    return true
  } else if (status === TransactionStatus.INVALID) {
    return true
  } else if (status === TransactionStatus.UNKNOWN) {
    return false
  }
}

/**
 * Returns minimal amount that can be transferred for the specified crypto
 * @param {string} crypto crypto
 * @returns {number}
 */
export function getMinAmount(crypto: CryptoSymbol) {
  let amount = CryptosInfo[crypto].minTransferAmount

  if (!amount) {
    const precision = CryptosInfo[crypto].cryptoTransferDecimals
    amount = precision ? Math.pow(10, -precision) : 0
  }

  return amount
}

/**
 * When clicking on replied message inside the chat that animation duration will
 * be applied while scrolling.
 **/
export const SCROLL_TO_REPLIED_MESSAGE_ANIMATION_DURATION = 300 // ms

export const FetchStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Error: 'error'
} as const

export const REACT_EMOJIS = {
  FACE_WITH_TEARS_OF_JOY: '😂',
  FIRE: '🔥',
  GRINNING_FACE_WITH_SMILING_EYES: '😄',
  THUMB_UP: '👍',
  OK_HAND: '👌',
  RED_HEART: '❤️',
  SLIGHTLY_SMILING_FACE: '🙂',
  THINKING_FACE: '🤔',
  WAVING_HAND: '👋',
  FOLDED_HANDS: '🙏',
  FLUSHED_FACE: '😳',
  PARTY_POPPER: '🎉'
} as const
