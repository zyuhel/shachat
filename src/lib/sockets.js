import { io } from 'socket.io-client'
import random from 'lodash/random'

/**
 * interface Events {
 *   [key: string]: Function[];
 * }
 */
export class EventEmitter {
  /**
   * @param {Events} events
   */
  constructor(events) {
    this.events = events || {}
  }

  /**
   * @param {string} event
   * @param {Function} cb
   */
  subscribe(event, cb) {
    ;(this.events[event] || (this.events[event] = [])).push(cb)

    return {
      unsubscribe: () =>
        this.events[event] && this.events[event].splice(this.events[event].indexOf(cb) >>> 0, 1)
    }
  }

  /**
   * @param {string} event
   * @param {any[]} args
   */
  emit(event, ...args) {
    ;(this.events[event] || []).forEach((fn) => fn(...args))
  }
}

export class SocketClient extends EventEmitter {
  adamantAddress = ''
  nodes = {}

  /**
   * The current node to which we are connected
   * @type {string}
   */
  currentNode = {}

  /**
   * Set true when chat messages are loaded
   * @type {boolean}
   */
  isSocketReady = false

  /**
   * Sync with store.state.options.useSocketConnection
   * @type {boolean}
   */
  isSocketEnabled = false

  /**
   * Sync with store.state.nodes.useFastest
   * @type {boolean}
   */
  useFastest = false

  interval = null

  /**
   * Interval to revise socket connection on fastest node update, on disconnect, etc.
   * @type {number}
   */
  REVISE_CONNECTION_TIMEOUT = 5000

  /**
   * Get random socket address.
   * @returns {string}
   */
  get socketNode() {
    const node = this.useFastest ? this.fastestNode : this.randomNode

    let socketUrl = node.wsProtocol + '//' + node.hostname
    if (node.wsPortNeeded) {
      socketUrl += ':' + node.wsPort
    }

    node.socketAddress = socketUrl
    return node
  }

  get fastestNode() {
    const onlineNodes = this.nodes.filter(this.isActiveSocketNode)
    if (onlineNodes.length === 0) return undefined
    return onlineNodes.reduce((fastest, current) =>
      current.ping < fastest.ping ? current : fastest
    )
  }

  get randomNode() {
    const onlineNodes = this.nodes.filter(this.isActiveSocketNode)
    return onlineNodes[random(onlineNodes.length - 1)]
  }

  get hasActiveNodes() {
    return Object.values(this.nodes).some(this.isActiveSocketNode)
  }

  get isOnline() {
    return this.connection && this.connection.connected
  }

  get isCurrentNodeActive() {
    return this.nodes.some(
      (node) => node.hostname === this.currentNode.hostname && this.isActiveSocketNode(node)
    )
  }

  /**
   * Update nodes statuses.
   * @param nodes
   */
  setNodes(nodes) {
    this.nodes = nodes
  }

  setAdamantAddress(address) {
    this.adamantAddress = address
  }

  setSocketReady(value) {
    this.isSocketReady = value
  }

  setSocketEnabled(value) {
    this.isSocketEnabled = value
    if (!value) this.disconnect()
  }

  /**
   * @param {boolean} value
   */
  setUseFastest(value) {
    this.useFastest = value
  }

  /**
   * Subscribe to socket events.
   */
  subscribeToEvents() {
    if (this.connection) {
      this.connection.on('newTrans', (transaction) => {
        if (transaction.type === 0 || transaction.type === 8) this.emit('newMessage', transaction)
      })
    }
  }

  /**
   * @param address ADAMANT address
   */
  init(address) {
    this.setAdamantAddress(address)
    this.setSocketReady(true)
    this.interval = setTimeout(() => this.reviseConnection(), this.REVISE_CONNECTION_TIMEOUT)
  }

  destroy() {
    clearTimeout(this.interval)
    this.setSocketReady(false)
    this.disconnect()
  }

  connect(node) {
    console.log(`[Socket] Connecting to ${node.socketAddress}..`)
    this.connection = io(`${node.socketAddress}`, { reconnection: false, timeout: 5000 })

    this.connection.on('connect', () => {
      this.currentNode = node
      console.log(
        `[Socket] Connected to ${node.socketAddress} and subscribed to transactions of ${this.adamantAddress}`
      )
      this.connection.emit('address', this.adamantAddress)
    })

    this.connection.on('disconnect', (reason) => {
      // if (reason === 'ping timeout' || reason === 'io server disconnect') {
      // if (reason != 'io client disconnect') {
      console.warn('[Socket] Disconnected. Reason:', reason)
      // }
    })

    this.connection.on('connect_error', (err) => {
      console.warn('[Socket] connect_error', err)
    })
  }

  disconnect() {
    return this.connection && this.connection.close()
  }

  reviseConnection() {
    if (!this.isSocketReady) return
    if (!this.isSocketEnabled) return
    if (!this.hasActiveNodes) {
      this.disconnect()
      console.warn('[Socket]: No active nodes')
      this.interval = setTimeout(() => this.reviseConnection(), this.REVISE_CONNECTION_TIMEOUT)
      return
    }

    const node = this.socketNode

    if (
      (this.isOnline && this.useFastest && this.currentNode.hostname !== node.hostname) ||
      !this.isOnline ||
      !this.isCurrentNodeActive
    ) {
      this.disconnect()
      this.connect(node)
      this.subscribeToEvents()
    }
    this.interval = setTimeout(() => this.reviseConnection(), this.REVISE_CONNECTION_TIMEOUT)
  }

  /**
   * @param {Node} node
   */
  isActiveSocketNode(node) {
    return (
      node.online &&
      node.active &&
      !node.outOfSync &&
      node.socketSupport &&
      node.hasMinNodeVersion &&
      node.hasSupportedProtocol
    )
  }
}

export default new SocketClient()
