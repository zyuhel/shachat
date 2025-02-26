import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { createBtcLikeClient } from '../utils/createBtcLikeClient'
import { Node } from '@/lib/nodes/abstract.node'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { formatBtcVersion } from '@/lib/nodes/utils/nodeVersionFormatters'
import { RpcRequest, RpcResponse } from './types/api/common'
import { NetworkInfo } from './types/api/network-info'
import { BlockchainInfo } from './types/api/blockchain-info'

/**
 * Encapsulates a node. Provides methods to send API-requests
 * to the node and verify is status (online/offline, version, ping, etc.)
 */
export class BtcNode extends Node<AxiosInstance> {
  constructor(url: string) {
    super(url, 'btc', 'node', NODE_LABELS.BtcNode)
  }

  protected buildClient(): AxiosInstance {
    return createBtcLikeClient(this.url)
  }

  protected async checkHealth() {
    const time = Date.now()

    const { blocks } = await this.invoke<BlockchainInfo>({
      method: 'getblockchaininfo'
    })

    return {
      height: Number(blocks),
      ping: Date.now() - time
    }
  }

  protected async fetchNodeVersion(): Promise<void> {
    const { version } = await this.invoke<NetworkInfo>({
      method: 'getnetworkinfo'
    })

    if (version) {
      this.version = formatBtcVersion(version)
    }
  }

  /**
   * Performs an RPC request to the Bitcoin node.
   */
  async invoke<Result = any, Params extends RpcRequest = RpcRequest>(
    params?: Params,
    requestConfig?: AxiosRequestConfig
  ): Promise<Result> {
    return this.client
      .request<RpcResponse<Result>>({
        ...requestConfig,
        method: 'POST',
        data: params
      })
      .then((res) => res.data)
      .then(({ result, error }) => {
        if (error) throw new Error(error.message)

        return result
      })
  }
}
