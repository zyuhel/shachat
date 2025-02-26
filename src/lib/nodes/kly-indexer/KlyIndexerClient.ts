import { AxiosRequestConfig } from 'axios'
import { KLY_TOKEN_ID } from '@/lib/klayr'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { TransactionNotFound } from '@/lib/nodes/utils/errors'
import { normalizeTransaction } from './utils'
import { TransactionParams } from './types/api/transactions/transaction-params'
import { Endpoints } from './types/api/endpoints'
import { KlyIndexer } from './KlyIndexer'
import { Client } from '../abstract.client'

export class KlyIndexerClient extends Client<KlyIndexer> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('kly', 'service', NODE_LABELS.KlyIndexer)
    this.nodes = endpoints.map((endpoint) => new KlyIndexer(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  private async request<E extends keyof Endpoints>(
    endpoint: E,
    params?: Endpoints[E]['params'],
    axiosRequestConfig?: AxiosRequestConfig
  ): Promise<Endpoints[E]['result']> {
    return this.getNode().request(endpoint, params, axiosRequestConfig)
  }

  /**
   * Query transactions history
   *
   * @param params Query params
   * @param address Owner address
   */
  async getTransactions(params: TransactionParams, address: string) {
    const { data: transactions } = await this.request('GET /transactions', {
      ...params,
      moduleCommand: 'token:transfer'
    })

    return transactions.map((transaction) => normalizeTransaction(transaction, address))
  }

  async isTransactionFinalized(transactionID: string): Promise<boolean> {
    const { data: transactions } = await this.request('GET /transactions', {
      transactionID
    })

    const transaction = transactions[0]

    if (!transaction) {
      return false
    }

    const isFinalized =
      transaction.executionStatus === 'successful' || transaction.executionStatus === 'failed'

    return isFinalized
  }

  /**
   * Returns a single transaction by ID
   *
   * @param transactionID
   * @param address
   */
  async getTransaction(transactionID: string, address: string) {
    const { data: transactions } = await this.request('GET /transactions', {
      transactionID
    })

    const transaction = transactions[0]

    if (!transaction) {
      throw new TransactionNotFound(transactionID, this.type)
    }

    return normalizeTransaction(transaction, address)
  }

  /**
   * Checks if an account exists
   * @param address
   * @param axiosRequestConfig
   */
  async checkAccountExists(address: string, axiosRequestConfig?: AxiosRequestConfig) {
    const { data } = await this.request(
      'GET /token/account/exists',
      {
        address,
        tokenID: KLY_TOKEN_ID
      },
      axiosRequestConfig
    )

    return data.isExists
  }
}
