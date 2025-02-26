/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface NodeInfo {
  url: string
  alt_ip?: string
  hasIndex?: boolean
}

export interface NodeHealthcheck {
  /** Regular node status update interval in ms */
  normalUpdateInterval: number
  /** Node status update interval when there are no active nodes, in ms */
  crucialUpdateInterval: number
  /** On the node screen, the status update interval in ms */
  onScreenUpdateInterval: number
  /** Permissible height difference between nodes */
  threshold: number
}

export interface ProjectLink {
  name: string
  url: string
}

export interface Service {
  /** Service node description */
  description: ServiceDescription
  list: NodeInfo[]
  healthCheck: ServiceHealthcheck
  displayName: string
}

/** Service node description */
export interface ServiceDescription {
  software: string
  github?: string
  docs?: string
}

export interface ServiceHealthcheck {
  /** Regular node status update interval in ms */
  normalUpdateInterval: number
  /** Node status update interval when there are no active nodes, in ms */
  crucialUpdateInterval: number
  /** On the node screen, the status update interval in ms */
  onScreenUpdateInterval: number
}

/** Timeouts when sending messages in chat. See [README.md](https://github.com/Adamant-im/adamant-wallets/blob/master/README.md#message-sending) for details. */
export interface MessageTimeout {
  /** Timeout for regular messages (in milliseconds) */
  message: string
  /** Timeout for file transfers (in milliseconds) */
  attachment: number
}

export interface TokenGeneral {
  /** Readable coin name */
  name: string
  /** Readable coin short name */
  nameShort?: string
  /** Project website URL */
  website: string
  /** Short description */
  description: string
  /** Explorer URL */
  explorer?: string
  /** URL to get tx info */
  explorerTx?: string
  /** URL to get address info */
  explorerAddress?: string
  /** URL to get contract info */
  explorerContract?: string
  /** RegEx to validate coin address */
  regexAddress?: string
  /** Research URL */
  research?: string
  /** Coin ticker */
  symbol: string
  /** Coin or token mainly */
  type: 'coin' | 'ERC20'
  /** Decimal places */
  decimals: number
  /** Max precision for tx */
  cryptoTransferDecimals: number
  /** Minimum acceptable amount for an address */
  minBalance?: number
  /** Minimum acceptable amount for tx */
  minTransferAmount?: number
  /** Fixed transfer fee */
  fixedFee?: number
  /** When the transfer fee is variable, but an app has not yet calculated it */
  defaultFee?: number
  /** QR code prefix for an address */
  qqPrefix?: string
  /** Should the coin be processed */
  status: 'active' | 'disabled'
  /** Should an app itself create the coin or only use the info for the blockchain */
  createCoin: boolean
  /** To show a coin by default, or hide it */
  defaultVisibility?: boolean
  /** Default ordinal number in a wallet list. Coins with the same ordinal number are sorted alphabetically. Coins without an order are shown last, alphabetically */
  defaultOrdinalLevel?: number
  /** Blockchain consensus type */
  consensus?: string
  /** Fixed block time in ms */
  blockTimeFixed?: number
  /** Average block time in ms */
  blockTimeAvg?: number
  txFetchInfo?: {
    /** Interval between fetching Tx in ms when its current status is "Pending" for new transactions */
    newPendingInterval?: number
    /** Interval between fetching Tx in ms when its current status is "Pending" for old transactions */
    oldPendingInterval?: number
    /** Interval between fetching Tx in ms when its current status is "Registered" */
    registeredInterval?: number
    /** Attempts to fetch Tx when its current status is "Pending" for new transactions */
    newPendingAttempts?: number
    /** Attempts to fetch Tx when its current status is "Pending" for old transactions */
    oldPendingAttempts?: number
  }
  /** Timeouts when sending messages in chat. See [README.md](https://github.com/Adamant-im/adamant-wallets/blob/master/README.md#message-sending) for details. */
  timeout?: MessageTimeout
  /** Time in ms when difference between in-chat transfer and Tx timestamp considered as acceptable */
  txConsistencyMaxTime?: number
  nodes?: {
    /** Node links for API */
    list: NodeInfo[]
    healthCheck: NodeHealthcheck
    displayName: string
    /**
     * Minimal node API version
     * @example "0.8.0"
     */
    minVersion?: string
    /**
     * A time correction for the message transactions on ADM
     * @example 500
     */
    nodeTimeCorrection?: number
  }
  services?: Record<string, Service>
  /** Additional project links */
  links?: ProjectLink[]
  tor?: {
    /** Project website URL (Tor) */
    website?: string
    /** Explorer URL (Tor) */
    explorer?: string
    /** URL to get tx info (Tor) */
    explorerTx?: string
    /** URL to get address info (Tor) */
    explorerAddress?: string
    nodes?: {
      /** Node links for API */
      list: NodeInfo[]
      healthCheck: NodeHealthcheck
      displayName: string
      /**
       * Minimal node API version
       * @example "0.8.0"
       */
      minVersion?: string
      /**
       * A time correction for the message transactions on ADM
       * @example 500
       */
      nodeTimeCorrection?: number
    }
    services?: Record<string, Service>
    /** Additional project links (Tor) */
    links?: ProjectLink[]
  }
}

export interface TokenAsset {
  /** Readable coin name */
  name: string
  /** Coin ticker */
  symbol: string
  /** Should the coin be processed */
  status: 'active' | 'disabled'
  /** ID of contract */
  contractId: string
  /** To show a coin by default, or hide it */
  defaultVisibility?: boolean
  /** Default ordinal number in a wallet list. Coins with the same ordinal number are sorted alphabetically. Coins without an order are shown last, alphabetically */
  defaultOrdinalLevel?: number
  /** Decimal places */
  decimals: number
}

export interface Blockchain {
  /** Blockchain readable name */
  blockchain: string
  /** How an app should mark token blockchain */
  type: string
  /** A coin containing parameters common to the blockchain */
  mainCoin: string
  /** Coin to pay fees in */
  fees: string
  defaultGasLimit?: number
}
