import { convertBeddowsTokly } from '@klayr/transactions'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { KLY_TOKEN_ID } from '@/lib/klayr'
import { RpcMethod, RpcResults } from './types/api'
import { KlyNode } from './KlyNode'
import { Client } from '../abstract.client'

export class KlyClient extends Client<KlyNode> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('kly', 'node', NODE_LABELS.KlyNode)
    this.nodes = endpoints.map((endpoint) => new KlyNode(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  private async invoke<M extends RpcMethod>(
    method: M,
    params?: RpcResults[M]['params']
  ): Promise<RpcResults[M]['result']> {
    return this.getNode().invoke(method, params)
  }

  /**
   * @param address KLY address (e.g.: "klyfan97j6phfdc3odtoorfabxdqtdymah55wnkk9")
   */
  async getNonce(address: string) {
    const { nonce } = await this.invoke('auth_getAuthAccount', { address })

    return nonce
  }

  /**
   * @param address KLY address (e.g.: "klyfan97j6phfdc3odtoorfabxdqtdymah55wnkk9")
   */
  async getBalance(address: string) {
    const { availableBalance } = await this.invoke('token_getBalance', {
      tokenID: KLY_TOKEN_ID,
      address
    })

    return Number(convertBeddowsTokly(availableBalance))
  }

  async getHeight() {
    const { height } = await this.invoke('system_getNodeInfo')

    return height
  }

  async sendTransaction(transaction: string, dryRun?: boolean) {
    if (dryRun) {
      const result = await this.invoke('txpool_dryRunTransaction', { transaction })

      if ('errorMessage' in result) {
        throw new Error(result.errorMessage)
      }

      console.debug(`txpool_dryRunTransaction: Dry run transaction`, transaction, result)

      return 'debug_tx_id' // transactionId
    }

    const { transactionId } = await this.invoke('txpool_postTransaction', { transaction })
    return transactionId
  }
}
