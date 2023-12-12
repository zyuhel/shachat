import { IndexStatus } from './index-status/index-status'
import { TransactionParams } from './transactions/transaction-params'
import { Pagination } from './common/pagination'
import { Transaction } from './transactions/transaction'

export type Endpoints = {
  /**
   * @see https://lisk.com/documentation/api/lisk-service-http.html#/Transactions/get_transactions
   */
  'GET /transactions': {
    params?: TransactionParams
    result: {
      data: Transaction[]
      meta: Pagination
    }
  }
  /**
   * @see https://lisk.com/documentation/api/lisk-service-http.html#/Index%20Status/get_index_status
   */
  'GET /index/status': {
    params: undefined
    result: IndexStatus
  }
}
