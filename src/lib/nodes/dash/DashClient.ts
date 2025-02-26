import { AxiosRequestConfig } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { DashNode } from './DashNode'
import { Client } from '../abstract.client'
import { normalizeTransaction } from './utils'
import { RpcRequest } from './types/api/common'
import { UTXO } from './types/api/utxo'
import { Balance } from './types/api/balance'
import { Transaction } from './types/api/transaction'

export class DashClient extends Client<DashNode> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('dash', 'node', NODE_LABELS.DashNode)
    this.nodes = endpoints.map((endpoint) => new DashNode(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  /**
   * Performs an RPC request to the Dash node.
   */
  async invoke<Result = any, Request extends RpcRequest = RpcRequest>(
    params: Request,
    requestConfig?: AxiosRequestConfig
  ) {
    return this.getNode().invoke<Result, Request>(params, requestConfig)
  }

  /**
   * Performs many RPC requests to the Dash node.
   */
  async invokeMany<Result = any, Request extends RpcRequest = RpcRequest>(
    params: Request[],
    requestConfig?: AxiosRequestConfig
  ) {
    return this.getNode().invokeMany<Result, Request>(params, requestConfig)
  }

  async getTransaction(transactionId: string, address: string) {
    const transaction = await this.invoke<Transaction>({
      method: 'getrawtransaction',
      params: [transactionId, true]
    })

    return normalizeTransaction(transaction, address)
  }

  async getTransactionHex(transactionId: string) {
    const transaction = await this.invoke<string>({
      method: 'getrawtransaction',
      params: [transactionId, false]
    })

    return transaction
  }

  async getTransactionsIds() {
    return this.invoke<string[]>({ method: 'getaddresstxids' })
  }

  async getTransactions(address: string) {
    const txIds = await this.getTransactionsIds()

    const rpcCalls = txIds.map((txId) => ({
      method: 'getrawtransaction',
      params: [txId, true]
    }))

    const results = await this.invokeMany<Transaction>(rpcCalls)

    const transactions = results
      .filter((x) => !x.error && x.result)
      .map((x) => x.result) as Transaction[]

    return transactions.map((transaction) => normalizeTransaction(transaction, address))
  }

  async getUnspents(address: string) {
    const unspents = await this.invoke<UTXO[]>({
      method: 'getaddressutxos',
      params: [address]
    })

    return unspents
  }

  async getBalance(address: string) {
    const result = await this.invoke<Balance>({
      method: 'getaddressbalance',
      params: [address]
    })

    return Number(result.balance)
  }

  async getHeight() {
    const result = await this.invoke<number>({
      method: 'getblockcount'
    })

    return result
  }
}
