import { TransactionStatusType } from '@/lib/constants'

export type CoinTransaction = {
  id: string
  hash: string
  fee: number
  status: TransactionStatusType
  timestamp?: number
  direction: 'from' | 'to'
  /**
   * Sender coin address
   */
  senderId: string
  /**
   * Recipient coin address
   */
  recipientId: string
  /**
   * Amount of coins
   */
  amount: number
  confirmations?: number
}

export type KlyTransaction = CoinTransaction & {
  data: string
  height?: number
  nonce: string
  module: 'token'
  command: 'transfer'
}

export type EthTransaction = Omit<CoinTransaction, 'timestamp'> & {
  blockNumber?: number
  time?: number // timestamp in seconds
  timestamp?: number // timestamp in milliseconds
}

export type Erc20Transaction = EthTransaction & {
  gasPrice: number
}

export type BtcTransaction = Omit<CoinTransaction, 'confirmations'> & {
  time: number // in seconds
  confirmations: number
  senders: string[]
  recipients: string[]
  height: number
}

export type DogeTransaction = Omit<BtcTransaction, 'height'>
export type DashTransaction = BtcTransaction

export type AnyCoinTransaction =
  | BtcTransaction
  | DogeTransaction
  | DashTransaction
  | EthTransaction
  | KlyTransaction
