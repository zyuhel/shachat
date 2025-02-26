import { isNodeOfflineError } from '@/lib/nodes/utils/errors'
import { AxiosProgressEvent } from 'axios'
import { NODE_LABELS } from '@/lib/nodes/constants'
import { IpfsNode, Payload, RequestConfig } from './IpfsNode'
import { Client } from '../abstract.client'

/**
 * Provides methods for calling the ADAMANT API.
 *
 * The `ApiClient` instance automatically selects an ADAMANT node to
 * send the API-requests to and switches to another node if the current one
 * is not available at the moment.
 */
export class IpfsClient extends Client<IpfsNode> {
  constructor(endpoints: string[] = [], minNodeVersion = '0.0.0') {
    super('ipfs', 'service', NODE_LABELS.IpfsNode)
    this.nodes = endpoints.map((endpoint) => new IpfsNode(endpoint, minNodeVersion))
    this.minNodeVersion = minNodeVersion

    void this.watchNodeStatusChange()
  }

  async downloadFile(cid: string) {
    return this.request({
      method: 'get',
      url: `api/file/${cid}`,
      responseType: 'arraybuffer'
    })
  }

  async upload(payload: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) {
    return this.request({
      method: 'post',
      url: '/api/file/upload',
      payload,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })
  }

  /**
   * Performs a GET API request.
   * @param {String} url relative API url
   * @param {any} params request params (an object) or a function that accepts `ApiNode` and returns the request params
   */
  get<P extends Payload = Payload>(url: string, params: P) {
    return this.request({ method: 'get', url, payload: params })
  }

  /**
   * Performs a POST API request.
   * @param {String} url relative API url
   * @param {any} payload request payload (an object) or a function that accepts `ApiNode` and returns the request payload
   * @param {Record<string, string>} headers request headers
   */
  post<P extends Payload = Payload>(url: string, payload: P, headers: Record<string, string>) {
    return this.request({ method: 'post', url, payload, headers })
  }

  /**
   * Performs an API request.
   * @param {RequestConfig} config request config
   */
  async request<P extends Payload = Payload, R = any>(config: RequestConfig<P>): Promise<R> {
    const node = this.useFastest ? this.getFastestNode() : this.getRandomNode()
    if (!node) {
      // All nodes seem to be offline: let's refresh the statuses
      this.checkHealth()
      // But there's nothing we can do right now
      return Promise.reject(new Error('No online nodes at the moment'))
    }

    return node.request(config).catch((error) => {
      if (isNodeOfflineError(error)) {
        // Initiate nodes status check
        this.checkHealth()
        // If the selected node is not available, repeat the request with another one.
        return this.request(config)
      }
      throw error
    })
  }
}
