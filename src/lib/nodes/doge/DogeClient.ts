import { AxiosRequestConfig } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { RpcRequest } from './types/api/common'
import { DogeNode } from './DogeNode'
import { Client } from '../abstract.client'

export class DogeClient extends Client<DogeNode> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('doge', 'node', NODE_LABELS.DogeNode)
    this.nodes = endpoints.map((endpoint) => new DogeNode(endpoint))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  /**
   * Performs a request to the Doge node.
   */
  async request<Response = any, Params extends RpcRequest = RpcRequest>(
    params?: Params,
    requestConfig?: AxiosRequestConfig
  ) {
    return this.getNode().invoke<Response, Params>(params, requestConfig)
  }
}
