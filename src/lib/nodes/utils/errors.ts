import { NodeType } from '@/lib/nodes/types'

const CODES = {
  NODE_OFFLINE: 'NODE_OFFLINE',
  ALL_NODES_OFFLINE: 'ALL_NODES_OFFLINE',
  ALL_NODES_DISABLED: 'ALL_NODES_DISABLED'
} as const

/**
 * Custom error to indicate that the endpoint is not available
 */
export class NodeOfflineError extends Error {
  code = CODES.NODE_OFFLINE

  constructor() {
    super('Node is offline')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NodeOfflineError)
    }
  }
}

export function isNodeOfflineError(error: Error): error is NodeOfflineError {
  return (error as NodeOfflineError).code === CODES.NODE_OFFLINE
}

/**
 * Unified error class for all nodes. Must be used in `node.getTransaction()` method.
 */
export class TransactionNotFound extends Error {
  constructor(hash: string, chain: string) {
    super(`${chain}: Transaction ${hash} not found`)
  }
}

export class AllNodesOfflineError extends Error {
  code = CODES.ALL_NODES_OFFLINE
  nodeLabel: NodeType // to distinct eth-node from eth-indexer it may be better to use TNodeLabel

  constructor(label: NodeType) {
    super(`${label}: All nodes are offline`)

    this.nodeLabel = label
  }
}

export function isAllNodesOfflineError(error: Error): error is AllNodesOfflineError {
  return (error as AllNodesOfflineError).code === CODES.ALL_NODES_OFFLINE
}

export class AllNodesDisabledError extends Error {
  code = CODES.ALL_NODES_DISABLED
  nodeLabel: NodeType

  constructor(label: NodeType) {
    super(`${label}: All nodes are disabled`)

    this.nodeLabel = label
  }
}

export function isAllNodesDisabledError(error: Error): error is AllNodesDisabledError {
  return (error as AllNodesDisabledError).code === CODES.ALL_NODES_DISABLED
}

export class NoInternetConnectionError extends Error {
  constructor() {
    super();
  }
}
