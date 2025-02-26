import config from '@/config'
import { NodeInfo } from '@/types/wallets'
import { RateInfoClient } from '@/lib/nodes/rate-info-service/RateInfoClient'

const endpoints = (config.adm.services.infoService.list as NodeInfo[]).map(
  (endpoint) => endpoint.url
)
export const rateInfoClient = new RateInfoClient(endpoints)

export default rateInfoClient
