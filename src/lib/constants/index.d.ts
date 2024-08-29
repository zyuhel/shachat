import { Cryptos, CryptosInfo, CryptosOrder, CryptoSymbol } from './cryptos'

export declare const EPOCH: number

export declare const Transactions: {
  SEND: 0
  SIGNATURE: 1
  DELEGATE: 2
  VOTE: 3
  MULTI: 4
  DAPP: 5
  IN_TRANSFER: 6
  OUT_TRANSFER: 7
  CHAT_MESSAGE: 8
  STATE: 9
}

export declare const MessageType: {
  BASIC_ENCRYPTED_MESSAGE: 1
  RICH_CONTENT_MESSAGE: 2
  SIGNAL_MESSAGE: 3
  cryptoTransferMessage: (cryptoSymbol: string) => string
}

export type FiatCurrencySymbol = 'USD' | 'EUR' | 'RUB' | 'CNY' | 'JPY'

export declare const Rates: {
  [K in FiatCurrencySymbol]: K
}

export declare const RatesNames: Record<FiatCurrencySymbol, string>

export declare const Fees: {
  KVS: number
  ADM_TRANSFER: number
  NOT_ADM_TRANSFER: number
}

export declare const base64regex: RegExp

export declare const Symbols: {
  CLOCK: string
  HOURGLASS: string
  CROSS: string
}

export declare const Delegates: {
  ACTIVE_DELEGATES: number
}

export declare const WelcomeMessage: {
  ADAMANT_BOUNTY: string
  ADAMANT_ICO: string
}

export declare const test: keyof Cryptos

export declare const BTC_BASED: ReadonlyArray<CryptoSymbol>
export declare const KLY_BASED: ReadonlyArray<CryptoSymbol>
export declare const INSTANT_SEND: ReadonlyArray<CryptoSymbol>
export declare const ALLOW_TEXT_DATA: ReadonlyArray<CryptoSymbol>

export declare const isErc20: (crypto: CryptoSymbol) => boolean
export declare const isEthBased: (crypto: CryptoSymbol) => boolean
export declare const isFeeEstimate: (crypto: CryptoSymbol) => boolean
export declare const isBtcBased: (crypto: CryptoSymbol) => boolean
export declare const isKlyBased: (crypto: CryptoSymbol) => boolean
export declare const isSelfTxAllowed: (crypto: CryptoSymbol) => boolean
export declare const isInstantSendPossible: (crypto: CryptoSymbol) => boolean
export declare const isTextDataAllowed: (crypto: CryptoSymbol) => boolean

export declare const RE_KLY_ADDRESS_LEGACY: RegExp

export declare const DEFAULT_ETH_TRANSFER_GAS_LIMIT: number
export declare const DEFAULT_ERC20_TRANSFER_GAS_LIMIT: number
export declare const INCREASE_FEE_MULTIPLIER: number

export { Cryptos, CryptosInfo, CryptosOrder, CryptoSymbol }
export default {
  EPOCH,
  Transactions
}

export declare const UserPasswordArticleLink: string
export declare const UserPasswordHashSettings: {
  SALT: string
  ITERATIONS: number
  KEYLEN: number
  DIGEST: string
}

export type TransactionStatusType =
  | 'CONFIRMED'
  | 'PENDING'
  | 'REGISTERED'
  | 'REJECTED'
  | 'INVALID'
  | 'UNKNOWN'

export declare const TransactionStatus: {
  [K in TransactionStatusType]: K
}

export declare const TransactionAdditionalStatus: {
  NONE: boolean
  INSTANT_SEND: string
  ADM_REGISTERED: string
}

export declare const tsIcon: (status: TransactionStatusType) => string
export declare const tsColor: (status: TransactionStatusType) => string
export declare const tsUpdatable: (status: TransactionStatusType, currency: CryptoSymbol) => boolean

export function getMinAmount(crypto: CryptoSymbol): number

export declare const SCROLL_TO_REPLIED_MESSAGE_ANIMATION_DURATION: number

export declare const FetchStatus: {
  Idle: 'idle'
  Loading: 'loading'
  Success: 'success'
  Error: 'error'
}

export declare const REACT_EMOJIS: Record<string, string>

export declare const AnimationReactionType = {
  Incoming: 0,
  Outgoing: 1
}

export declare const ADAMANT_NOTIFICATION_SERVICE_ADDRESS: string
