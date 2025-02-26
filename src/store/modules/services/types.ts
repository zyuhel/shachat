import { NODE_LABELS } from '@/lib/nodes/constants'

export type ServicesState = {
  [NODE_LABELS.RatesInfo]: Record<string, { active: boolean }>
  [NODE_LABELS.BtcIndexer]: Record<string, { active: boolean }>
  [NODE_LABELS.DogeIndexer]: Record<string, { active: boolean }>
  [NODE_LABELS.EthIndexer]: Record<string, { active: boolean }>
  [NODE_LABELS.KlyIndexer]: Record<string, { active: boolean }>
  useFastestService: boolean
}

export type AvailableService =
  | 'rates-info'
  | 'btc-indexer'
  | 'doge-indexer'
  | 'eth-indexer'
  | 'kly-indexer'

export type StatusPayload = {
  serviceType: AvailableService
  status: { url: string; active: boolean }
}
export type TogglePayload = { type: AvailableService; url: string; active: boolean }
export type ToggleAllPayload = { active: boolean }
export type Node = { label: string, url: string }
