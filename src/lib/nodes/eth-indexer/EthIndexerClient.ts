import { AxiosRequestConfig } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { GetTransactionsParams } from './types/client/get-transactions-params'
import { GetTransactionsRequest } from './types/api/get-transactions/get-transactions.request'
import { Endpoints } from './types/api/endpoints'
import { EthIndexer } from './EthIndexer'
import { normalizeTransaction } from './utils'
import { Client } from '../abstract.client'

export class EthIndexerClient extends Client<EthIndexer> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('eth', 'service', NODE_LABELS.EthIndexer)
    this.nodes = endpoints.map((endpoint) => new EthIndexer(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  private async request<E extends keyof Endpoints>(
    endpoint: E,
    params?: Endpoints[E]['params'],
    axiosRequestConfig?: AxiosRequestConfig
  ): Promise<Endpoints[E]['result']> {
    const node = this.getNode()

    return node.request(endpoint, params, axiosRequestConfig)
  }

  /**
   * Query transactions history
   */
  async getTransactions(params: GetTransactionsParams) {
    const { address, contract, from, to, limit, decimals } = params

    const filters = []

    if (contract) {
      filters.push(
        `txto.eq.${contract}`,
        `or(txfrom.eq.${address},contract_to.eq.000000000000000000000000${address.replace(
          '0x',
          ''
        )})`
      )
    } else {
      filters.push('contract_to.eq.', `or(txfrom.eq.${address},txto.eq.${address})`)
    }

    if (from) {
      filters.push(`time.gte.${from}`)
    }

    if (to) {
      filters.push(`time.lte.${to}`)
    }

    const requestParams: GetTransactionsRequest = {
      and: `(${filters.join(',')})`,
      order: 'time.desc'
      // limit: limit ? limit : undefined
    }

    const transactions = await this.request('GET /ethtxs', {
      ...requestParams
    })

    return transactions
      .map((transaction) => normalizeTransaction(transaction, address, decimals))
      .slice(0, limit)
  }
}
