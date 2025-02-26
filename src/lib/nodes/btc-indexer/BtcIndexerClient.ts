import type { AxiosRequestConfig } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { Client } from '../abstract.client'
import { BtcIndexer } from './BtcIndexer'
import { MULTIPLIER, normalizeTransaction } from './utils'
import { Transaction } from './types/api/common/transaction'
import { UTXO } from './types/api/common/unspent'
import { GetAddressParams } from './types/api/get-address/get-address-params'
import { GetAddressResult } from './types/api/get-address/get-address-result'
import { GetUnspentsParams } from './types/api/get-unspents/get-unspents-params'

/**
 * Provides methods for calling the ADAMANT API.
 *
 * The `ApiClient` instance automatically selects an ADAMANT node to
 * send the API-requests to and switches to another node if the current one
 * is not available at the moment.
 */
export class BtcIndexerClient extends Client<BtcIndexer> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('btc', 'service', NODE_LABELS.BtcIndexer)
    this.nodes = endpoints.map((endpoint) => new BtcIndexer(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  /**
   * Performs a request to the BTC indexer.
   */
  async request<Response = any, Params = any>(
    method: 'GET' | 'POST',
    path: string,
    params?: Params,
    requestConfig?: AxiosRequestConfig
  ): Promise<Response> {
    return this.getNode().request<Response, Params>(method, path, params, requestConfig)
  }

  /**
   * Return transaction details normalized.
   *
   * @param transactionId Transaction ID
   * @param address Owner BTC address
   */
  async getTransaction(transactionId: string, address: string) {
    const transaction = await this.request<Transaction>('GET', `/tx/${transactionId}`)

    const height = await this.getHeight().catch((err) => {
      console.warn('BtcClient: Failed to get current height:', err)
      return undefined
    })

    return normalizeTransaction(transaction, address, height)
  }

  /**
   * Query transactions history
   *
   * @param address BTC address
   * @param toTx Until transaction ID. For pagination.
   */
  async getTransactions(address: string, toTx?: string) {
    const endpoint = toTx ? `/address/${address}/txs/chain/${toTx}` : `/address/${address}/txs`

    const transactions = await this.request<Transaction[]>('GET', endpoint)

    return transactions.map((transaction) => normalizeTransaction(transaction, address))
  }

  /**
   * Get unspent transaction outputs (UTXOs) for the specified address.
   * @param address BTC address
   */
  async getUnspents(address: string) {
    return this.request<UTXO[], GetUnspentsParams>('GET', `/address/${address}/utxo`)
  }

  async getFeeRate() {
    return this.request<Record<string, number>>('GET', '/fee-estimates')
  }

  async getHeight() {
    const height = await this.request<string>('GET', '/blocks/tip/height')

    return Number(height)
  }

  async getAddress(address: string) {
    return this.request<GetAddressResult, GetAddressParams>('GET', `/address/${address}`)
  }

  async getBalance(address: string) {
    const { chain_stats } = await this.getAddress(address)

    const balance = (chain_stats.funded_txo_sum - chain_stats.spent_txo_sum) / MULTIPLIER

    return balance
  }
}
