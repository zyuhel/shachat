import config from '@/config'
import { NodeInfo } from '@/types/wallets'
import { BtcIndexerClient } from './BtcIndexerClient'

const endpoints = (config.btc.services.btcIndexer.list as NodeInfo[]).map((endpoint) => endpoint.url)
export const btcIndexer = new BtcIndexerClient(endpoints)

export default btcIndexer
