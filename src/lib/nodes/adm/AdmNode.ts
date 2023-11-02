import utils from '@/lib/adamant'
import { NodeOfflineError } from '@/lib/nodes/utils/errors'
import { GetNodeStatusResponseDto } from '@/lib/schema/client'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Node } from '@/lib/nodes/abstract.node'

type FetchNodeInfoResult = {
  socketSupport: boolean
  version: string
  height: number
  wsPort?: string
}

export type Payload =
  | Record<string, any>
  | {
      (ctx: AdmNode): Record<string, any>
    }
export type RequestConfig<P extends Payload> = {
  url: string
  method?: string
  payload?: P
}

/**
 * Encapsulates a node. Provides methods to send API-requests
 * to the node and verify is status (online/offline, version, ping, etc.)
 */
export class AdmNode extends Node {
  client: AxiosInstance

  constructor(url: string, minNodeVersion = '0.0.0') {
    super(url, minNodeVersion)

    this.wsPort = '36668' // default wsPort
    this.wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:'
    this.wsPortNeeded = this.wsProtocol === 'ws:' && !this.hostname.includes('.onion')

    this.client = axios.create({
      baseURL: this.url
    })

    void this.fetchNodeInfo()
    void this.startHealthcheck()
  }

  /**
   * Performs an API request.
   *
   * The `payload` of the `cfg` can be either an object or a function that
   * accepts `ApiNode` as a first argument and returns an object.
   */
  request<P extends Payload = Payload, R = any>(cfg: RequestConfig<P>): Promise<R> {
    const { url, method = 'get', payload } = cfg

    const config: AxiosRequestConfig = {
      url,
      method: method.toLowerCase(),
      [method === 'get' ? 'params' : 'data']:
        typeof payload === 'function' ? payload(this) : payload
    }

    return this.client.request(config).then(
      (response) => {
        const body = response.data
        // Refresh time delta on each request
        if (body && isFinite(body.nodeTimestamp)) {
          this.timeDelta = utils.epochTime() - body.nodeTimestamp
        }

        return body
      },
      (error) => {
        // According to https://github.com/axios/axios#handling-errors this means, that request was sent,
        // but server could not respond.
        if (!error.response && error.request) {
          this.online = false
          throw new NodeOfflineError()
        }
        throw error
      }
    )
  }

  /**
   * Fetch node version, block height and ping.
   * @returns {Promise<{version: string, height: number, ping: number}>}
   */
  private async fetchNodeInfo(): Promise<FetchNodeInfoResult> {
    const response: GetNodeStatusResponseDto = await this.request({ url: '/api/node/status' })

    if (response.success) {
      const version = response.version.version
      const height = Number(response.network.height)
      const socketSupport = response.wsClient ? response.wsClient.enabled : false
      const wsPort = response.wsClient ? String(response.wsClient.port) : ''

      this.version = version
      this.height = height
      this.socketSupport = socketSupport
      this.wsPort = wsPort

      return {
        version,
        height,
        socketSupport,
        wsPort
      }
    }

    throw new Error('Request to /api/node/status was unsuccessful')
  }

  protected async checkHealth() {
    const time = Date.now()
    const nodeInfo = await this.fetchNodeInfo()

    return {
      height: nodeInfo.height,
      ping: Date.now() - time
    }
  }
}
