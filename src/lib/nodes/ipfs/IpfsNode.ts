import utils from '@/lib/adamant'
import { NodeOfflineError } from '@/lib/nodes/utils/errors'
import axios, { AxiosInstance, AxiosProgressEvent, AxiosRequestConfig, ResponseType } from 'axios'
import { Node } from '@/lib/nodes/abstract.node'
import { NODE_LABELS } from '@/lib/nodes/constants'

type FetchNodeInfoResult = {
  availableSizeInMb: number
  blockstoreSizeMb: number
  datastoreSizeMb: number
  heliaStatus: string
  timestamp: number
  version: string
}

export type Payload =
  | Record<string, any>
  | {
      (ctx: IpfsNode): Record<string, any>
    }
export type RequestConfig<P extends Payload> = {
  url: string
  headers?: Record<string, string>
  method?: string
  payload?: P
  onUploadProgress?: (progress: AxiosProgressEvent) => void
  responseType?: ResponseType
}

/**
 * Encapsulates a node. Provides methods to send API-requests
 * to the node and verify is status (online/offline, version, ping, etc.)
 */
export class IpfsNode extends Node<AxiosInstance> {
  constructor(url: string, minNodeVersion = '0.0.0') {
    super(url, 'ipfs', 'node', NODE_LABELS.IpfsNode, '', minNodeVersion)
  }

  protected buildClient(): AxiosInstance {
    return axios.create({
      baseURL: this.url,
      timeout: 60 * 10 * 1000
    })
  }

  /**
   * Performs an API request.
   *
   * The `payload` of the `cfg` can be either an object or a function that
   * accepts `ApiNode` as a first argument and returns an object.
   */
  request<P extends Payload = Payload, R = any>(cfg: RequestConfig<P>): Promise<R> {
    const { url, headers, method = 'get', payload, onUploadProgress } = cfg

    const config: AxiosRequestConfig = {
      url,
      method: method.toLowerCase(),
      headers,
      // responseType: url.includes('file') ? 'arraybuffer' : 'json',
      [method === 'get' ? 'params' : 'data']:
        typeof payload === 'function' ? payload(this) : payload,
      responseType: cfg.responseType,
      onUploadProgress
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
    const {
      availableSizeInMb,
      blockstoreSizeMb,
      datastoreSizeMb,
      heliaStatus,
      timestamp,
      version
    } = await this.request<Payload, FetchNodeInfoResult>({
      url: '/api/node/info'
    })

    this.version = version
    this.height = timestamp

    return {
      availableSizeInMb,
      blockstoreSizeMb,
      datastoreSizeMb,
      heliaStatus,
      timestamp,
      version
    }
  }

  protected async checkHealth() {
    const time = Date.now()
    const { timestamp } = await this.fetchNodeInfo()
    this.height = timestamp;

    return {
      height: this.height,
      ping: Date.now() - time
    }
  }

  formatHeight(height: number): string {
    return super.formatHeight(
      Number(Math.ceil(height / 1000)
        .toString()
        .substring(2)
      )
    )
  }
}
