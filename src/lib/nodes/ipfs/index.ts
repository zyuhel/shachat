import config from '@/config'
import { NodeInfo } from '@/types/wallets'
import { IpfsClient } from './IpfsClient'

const endpoints = (config.adm.services.ipfsNode.list as NodeInfo[]).map((endpoint) => endpoint.url)
export const ipfs = new IpfsClient(endpoints, config.adm.services.minVersion)

export default ipfs
