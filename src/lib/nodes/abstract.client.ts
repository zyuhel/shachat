import type { HealthcheckInterval, NodeKind, NodeType } from '@/lib/nodes/types'
import { TNodeLabel } from '@/lib/nodes/constants'
import { AllNodesDisabledError, AllNodesOfflineError } from './utils/errors'
import { filterSyncedNodes } from './utils/filterSyncedNodes'
import { Node } from './abstract.node'
import { nodesStorage } from './storage'

export abstract class Client<N extends Node> {
  /**
   * List of the available nodes
   */
  nodes: N[] = []
  /**
   * Minimum API version a node is required to have
   */
  minNodeVersion = ''
  /**
   * Indicates wether `ApiClient` should prefer the fastest node available.
   */
  useFastest = false
  /**
   * A callback that is called every time a node status is updated
   */
  statusUpdateCallback?: (status: ReturnType<Node['getStatus']>) => void
  /**
   * Node kind
   */
  kind: NodeKind
  /**
   * Node type
   */
  type: NodeType
  /**
   * Node label
   */
  label: TNodeLabel

  /**
   * Resolves when at least one node is ready to accept requests
   */
  ready: Promise<void>
  resolve = () => {}
  initialized = false

  constructor(type: NodeType, kind: NodeKind, label: TNodeLabel) {
    this.type = type
    this.kind = kind
    this.label = label
    this.useFastest = nodesStorage.getUseFastest(type)

    this.ready = new Promise((resolve) => {
      this.resolve = () => {
        if (this.initialized) return

        this.initialized = true
        resolve()
      }
    })
  }

  protected async watchNodeStatusChange() {
    for (const node of this.nodes) {
      node.onStatusChange((nodeStatus) => {
        this.updateSyncStatuses()

        this.statusUpdateCallback?.(nodeStatus)

        if (this.isActiveNode(node)) {
          // Resolve when at least one node is ready to accept requests
          this.resolve()
        }
      })
    }

    await Promise.all(this.nodes.map((node) => node.startHealthcheck()))
    this.resolve()
  }

  /**
   * Initiates healthcheck for each node.
   */
  checkHealth() {
    for (const node of this.nodes) {
      void node.startHealthcheck()
    }
  }

  updateHealthCheckInterval(interval: HealthcheckInterval) {
    for (const node of this.nodes) {
      void node.updateHealthCheckInterval(interval)
    }
  }

  // Use with caution:
  // This method can throw an error if there are no online nodes.
  // Better use "useClient()" method.
  getClient(): N['client'] {
    return this.getNode().client
  }

  /**
   * Invokes a client method.
   *
   * eth
   *   .useClient((client) => client.getTransactionCount(this.$store.state.eth.address))
   *   .then(res => console.log("res", res))
   *   .catch(err => console.log("err", err))
   *
   * @param cb
   */
  async useClient<T>(cb: (client: N['client']) => T) {
    const node = this.getNode()

    return cb(node.client)
  }

  /**
   * Returns endpoint statuses
   * @returns {Array<{ url: string, online: boolean, ping: number }>}
   */
  getNodes() {
    return this.nodes.map((node) => node.getStatus())
  }

  /**
   * Enables/disables a node.
   */
  toggleNode(url: string, active: boolean) {
    const node = this.nodes.find((x) => x.url === url)
    if (node) {
      return node.toggleNode(active)
    }
  }

  setUseFastest(state: boolean) {
    this.useFastest = state

    nodesStorage.setUseFastest(state, this.type, this.kind)
  }

  /**
   * Registers a status update callback.
   * @param {function({url: string, ping: number, online: boolean}): void} callback callback function
   */
  onStatusUpdate(callback: typeof this.statusUpdateCallback) {
    this.statusUpdateCallback = callback
  }

  /**
   * Returns a random node.
   * @returns {ApiNode}
   */
  protected getRandomNode() {
    const onlineNodes = this.nodes.filter(this.isActiveNode)
    return onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
  }

  /**
   * Returns the fastest node.
   */
  protected getFastestNode() {
    const onlineNodes = this.nodes.filter(this.isActiveNode)
    if (onlineNodes.length === 0) return undefined
    return onlineNodes.reduce((fastest, current) =>
      current.ping < fastest.ping ? current : fastest
    )
  }

  protected getNode() {
    const nodes = this.nodes.filter((node) => node.active)
    if (nodes.length === 0) {
      throw new AllNodesDisabledError(this.type)
    }

    const node = this.useFastest ? this.getFastestNode() : this.getRandomNode()
    if (!node) {
      // All nodes seem to be offline: let's refresh the statuses
      this.checkHealth()
      // But there's nothing we can do right now
      throw new AllNodesOfflineError(this.type)
    }

    return node
  }

  /**
   * Throws an error if all the nodes are offline.
   */
  assertAnyNodeOnline() {
    const onlineNodes = this.nodes.filter(this.isActiveNode)

    if (onlineNodes.length === 0) {
      throw new AllNodesOfflineError(this.type)
    }
  }

  /**
   * Updates `outOfSync` status of the nodes.
   *
   * Basic idea is the following: we look for the biggest group of nodes that have the same
   * height (considering HEIGHT_EPSILON). These nodes are considered to be in sync with the network,
   * all the others are not.
   */
  protected updateSyncStatuses() {
    const nodes = this.nodes.filter((x) => x.online && x.active)

    const nodesInSync = filterSyncedNodes(nodes, this.label)

    // Finally, all the nodes from the winner list are considered to be in sync, all the
    // others are not
    for (const node of nodes) {
      node.outOfSync = !nodesInSync.nodes.includes(node)
    }
  }

  protected isActiveNode(node: Node) {
    return (
      node.online &&
      node.active &&
      !node.outOfSync &&
      node.hasMinNodeVersion() &&
      node.hasSupportedProtocol
    )
  }
}
