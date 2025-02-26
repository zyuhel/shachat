import config from '@/config'
import { TNodeLabel } from '@/lib/nodes/constants'
import { HealthcheckInterval } from '@/lib/nodes/types'
import type { NodeHealthcheck } from '@/types/wallets'

export function getNodeHealthcheckConfig(nodeLabel: TNodeLabel): NodeHealthcheck {
  switch (nodeLabel) {
    case 'adm-node':
      return config.adm.nodes.healthCheck
    case 'eth-node':
      return config.eth.nodes.healthCheck
    case 'eth-indexer':
      return config.eth.services.ethIndexer.healthCheck
    case 'btc-node':
      return config.btc.nodes.healthCheck
    case 'btc-indexer':
      return config.btc.services.btcIndexer.healthCheck
    case 'doge-node':
    case 'doge-indexer':
      return config.doge.nodes.healthCheck
    case 'dash-node':
      return config.dash.nodes.healthCheck
    case 'ipfs-node':
      return config.adm.services.ipfsNode.healthCheck
    case 'kly-node':
      return config.kly.nodes.healthCheck
    case 'kly-indexer':
      return config.kly.services.klyService.healthCheck
    case 'rates-info':
      return config.adm.services.infoService.healthCheck
    default:
      throw new Error(`No healthcheck configuration found for ${nodeLabel}`)
  }
}

export function getHealthCheckInterval(nodeLabel: TNodeLabel, interval: HealthcheckInterval) {
  const config = getNodeHealthcheckConfig(nodeLabel)

  switch (interval) {
    case 'normal':
      return config.normalUpdateInterval
    case 'crucial':
      return config.crucialUpdateInterval
    case 'onScreen':
      return config.onScreenUpdateInterval
    default:
      throw new Error(
        `getNodeHealthCheckInterval: Interval ${interval} is not defined in the Node's config`
      )
  }
}
