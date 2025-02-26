import config from '@/config'
import { NodeInfo } from '@/types/wallets'
import { KlyIndexerClient } from './KlyIndexerClient'

const endpoints = (config.kly.services.klyService.list as NodeInfo[]).map(
  (endpoint) => endpoint.url
)
export const klyIndexer = new KlyIndexerClient(endpoints)

export default klyIndexer
