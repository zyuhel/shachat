import { AllCryptos, AllCryptosOrder, Cryptos, CryptosInfo, CryptosOrder } from './cryptos'

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
}

/**
 * @see https://github.com/Adamant-im/adamant/wiki/Message-Types
 */
export const MessageType = {
  BASIC_ENCRYPTED_MESSAGE: 1,
  RICH_CONTENT_MESSAGE: 2,
  SIGNAL_MESSAGE: 3,
  cryptoTransferMessage: (cryptoSymbol) => `${cryptoSymbol.toLowerCase()}_transaction`
}

export const Rates = {
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
  CNY: 'CNY',
  JPY: 'JPY'
}

export const RatesNames = {
  [Rates.USD]: 'USD ($)', // United States Dollar
  [Rates.EUR]: 'EUR (€)', // Euro
  [Rates.RUB]: 'RUB (₽)', // Russian Ruble
  [Rates.CNY]: 'CNY (¥)', // Chinese Yuan
  [Rates.JPY]: 'JPY (¥)' // Japanese Yen
}

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

// Some cryptos allows to save public data with a Tx
export const ALLOW_TEXT_DATA = Object.freeze([Cryptos.KLY])

export const isErc20 = (crypto) => CryptosInfo[crypto]?.type === 'ERC20'

export const isEthBased = (crypto) => isErc20(crypto) || crypto === Cryptos.ETH

export const isFeeEstimate = (crypto) => isEthBased(crypto)

export const isBtcBased = (crypto) => BTC_BASED.includes(crypto)

export const isKlyBased = (crypto) => KLY_BASED.includes(crypto)

export const isSelfTxAllowed = (crypto) => KLY_BASED.includes(crypto) || crypto === Cryptos.ADM

export const isInstantSendPossible = (crypto) => INSTANT_SEND.includes(crypto)

export const isTextDataAllowed = (crypto) => ALLOW_TEXT_DATA.includes(crypto)

export const RE_KLY_ADDRESS_LEGACY = /^[0-9]{2,21}L$/

/**
 * These gas limit values are used only for estimate fees for ETH & ERC-20 transfers in the Send tokens form,
 * Actual gas limit values are calculated with estimateGas(transactionObject)
 * when each specific transaction is created
 */

/** Gas limit value for the ETH transfers */
export const DEFAULT_ETH_TRANSFER_GAS_LIMIT = CryptosInfo['ETH'].defaultGasLimit
/** Gas limit value for the ERC-20 transfers */
export const DEFAULT_ERC20_TRANSFER_GAS_LIMIT = DEFAULT_ETH_TRANSFER_GAS_LIMIT * 2.4

/** Increase fee multiplier. Used as a checkbox on SendFundsForm */
export const INCREASE_FEE_MULTIPLIER = 1.5

export { AllCryptos, AllCryptosOrder, Cryptos, CryptosInfo, CryptosOrder }

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

/** Status of ADM or coin transaction */
export const TransactionStatus = {
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

export const tsIcon = function (status) {
  if (status === TransactionStatus.CONFIRMED) {
    return 'mdi-check'
  } else if (status === TransactionStatus.PENDING || status === TransactionStatus.REGISTERED) {
    return 'mdi-clock-outline'
  } else if (status === TransactionStatus.REJECTED) {
    return 'mdi-close-circle-outline'
  } else if (status === TransactionStatus.INVALID) {
    return 'mdi-alert-outline'
  } else if (status === TransactionStatus.UNKNOWN) {
    return 'mdi-help-circle-outline'
  }
}

export const tsColor = function (status) {
  if (status === TransactionStatus.REJECTED) {
    return 'red'
  } else if (status === TransactionStatus.INVALID || status === TransactionStatus.UNKNOWN) {
    return 'yellow'
  }
  return ''
}

export const tsUpdatable = function (status, currency) {
  currency = currency.toUpperCase()
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
export function getMinAmount(crypto) {
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
}

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
}

export const AnimationReactionType = {
  Incoming: 0,
  Outgoing: 1
}

// https://github.com/Adamant-im/adamant-ns
export const ADAMANT_NOTIFICATION_SERVICE_ADDRESS = 'U922832474468487910'
