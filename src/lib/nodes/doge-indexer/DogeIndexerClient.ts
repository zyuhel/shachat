import type { AxiosRequestConfig } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { DogeIndexer } from './DogeIndexer'
import { Client } from '../abstract.client'
import { NB_BLOCKS } from './constants'
import { normalizeTransaction } from './utils'
import { NodeStatus } from './types/api/node-status'
import { Transaction, GetTransactionsParams } from './types/api/transaction'
import { GetUnspentsParams, UTXO } from './types/api/utxo'
import { AddressInfo } from './types/api/address'
import { EstimatedFee, GetEstimatedFeeParams } from './types/api/estimated-fee'
import { Balance } from './types/api/balance'

export class DogeIndexerClient extends Client<DogeIndexer> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('doge', 'service', NODE_LABELS.DogeIndexer)
    this.nodes = endpoints.map((endpoint) => new DogeIndexer(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  /**
   * Performs a request to the Doge indexer.
   */
  async request<Response = any, Params = any>(
    method: 'GET' | 'POST',
    path: string,
    params?: Params,
    requestConfig?: AxiosRequestConfig
  ): Promise<Response> {
    return this.getNode().request<Response, Params>(method, path, params, requestConfig)
  }

  async getTransaction(transactionId: string, address: string) {
    const transaction = await this.request<Transaction>('GET', `/api/tx/${transactionId}`)

    return normalizeTransaction(transaction, address)
  }

  async getTransactions(address: string, params: GetTransactionsParams = {}) {
    const transactions = await this.request<Transaction[], GetTransactionsParams>(
      'GET',
      `/api/addrs/${address}/txs`,
      params
    )

    return transactions.map((transaction) => normalizeTransaction(transaction, address))
  }

  async getUnspents(address: string, params: GetUnspentsParams = { noCache: 1 }) {
    return this.request<UTXO[], GetUnspentsParams>('GET', `/api/addr/${address}/utxo`, params)
  }

  /**
   * Must be divided by 1024 to get the fee in satoshis per byte.
   * @param params
   */
  async getEstimatedFee(params: GetEstimatedFeeParams = { nbBlocks: NB_BLOCKS }) {
    return this.request<EstimatedFee, GetEstimatedFeeParams>(
      'GET',
      '/api/utils/estimatefee',
      params
    )
  }

  async getAddress(address: string) {
    return this.request<AddressInfo>('GET', `/api/addr/${address}`)
  }

  async getBalance(address: string) {
    const balance = await this.request<Balance>('GET', `/api/addr/${address}/balance`)

    return Number(balance)
  }

  async getHeight() {
    const { info } = await this.request<NodeStatus>('GET', '/api/status')

    return info.blocks
  }
}
