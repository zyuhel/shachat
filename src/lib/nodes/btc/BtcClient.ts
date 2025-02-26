import type { AxiosRequestConfig } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { BtcNode } from './BtcNode'
import { Client } from '../abstract.client'
import { RpcRequest } from './types/api/common'

/**
 * Provides methods for calling the ADAMANT API.
 *
 * The `ApiClient` instance automatically selects an ADAMANT node to
 * send the API-requests to and switches to another node if the current one
 * is not available at the moment.
 */
export class BtcClient extends Client<BtcNode> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('btc', 'node', NODE_LABELS.BtcNode)
    this.nodes = endpoints.map((endpoint) => new BtcNode(endpoint))
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
}
