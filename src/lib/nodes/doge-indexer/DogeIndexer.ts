import { createBtcLikeClient } from '../utils/createBtcLikeClient'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Node } from '@/lib/nodes/abstract.node'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { formatDogeVersion } from '@/lib/nodes/utils/nodeVersionFormatters'
import { NodeStatus } from './types/api/node-status'

/**
 * Encapsulates a node. Provides methods to send API-requests
 * to the node and verify is status (online/offline, version, ping, etc.)
 */
export class DogeIndexer extends Node<AxiosInstance> {
  constructor(url: string) {
    super(url, 'doge', 'service', NODE_LABELS.DogeIndexer)
  }

  protected buildClient(): AxiosInstance {
    return createBtcLikeClient(this.url)
  }

  protected async checkHealth() {
    const time = Date.now()
    const height = await this.client
      .get('/api/blocks?limit=0')
      .then((res) => res.data.blocks[0].height)

    return {
      height,
      ping: Date.now() - time
    }
  }

  protected async fetchNodeVersion(): Promise<void> {
    const data = await this.request<NodeStatus>('GET', '/api/status')
    const { version } = data.info
    if (version) {
      this.version = formatDogeVersion(version)
    }
  }

  /**
   * Performs a request to the Doge Indexer.
   */
  async request<Response = any, Params = any>(
    method: 'GET' | 'POST',
    path: string,
    params?: Params,
    requestConfig?: AxiosRequestConfig
  ): Promise<Response> {
    return this.client
      .request({
        ...requestConfig,
        url: path,
        method,
        params: method === 'GET' ? params : undefined,
        data: method === 'POST' ? params : undefined
      })
      .then((res) => res.data)
  }
}