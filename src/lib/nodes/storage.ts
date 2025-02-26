import { TypedStorage } from '@/lib/typed-storage'
import { NodeKind, NodeType } from './types'

type URL = string
type Enabled = boolean
type State = Record<URL, Enabled>

type Options = Record<
  NodeType,
  {
    node: { useFastest: boolean }
    service: { useFastest: boolean }
  }
>

const NODES_STATE_STORAGE_KEY = 'NODES_STATE_STORAGE' // for storing active/inactive state
const NODES_OPTIONS_STORAGE_KEY = 'NODES_OPTIONS_STORAGE' // for storing common options

const stateStorage = new TypedStorage(NODES_STATE_STORAGE_KEY, {} as State, window.localStorage)

const defaultConfig = {
  node: { useFastest: false },
  service: { useFastest: false }
}
const defaultOptions: Options = {
  adm: defaultConfig,
  btc: defaultConfig,
  doge: defaultConfig,
  dash: defaultConfig,
  eth: defaultConfig,
  kly: defaultConfig,
  ipfs: defaultConfig
}

const optionsStorage = new TypedStorage(
  NODES_OPTIONS_STORAGE_KEY,
  defaultOptions,
  window.localStorage
)

export const nodesStorage = {
  isActive(url: string): boolean {
    const state = stateStorage.getItem()

    return state[url] ?? true
  },
  saveActive(url: string, enabled: boolean) {
    const state = stateStorage.getItem()
    state[url] = enabled

    stateStorage.setItem(state)
  },
  getUseFastest(node: NodeType, kind: NodeKind = 'node') {
    const options = optionsStorage.getItem()

    return !!options[node]?.[kind]?.useFastest
  },
  setUseFastest(value: boolean, node: NodeType, kind: NodeKind = 'node') {
    const options = optionsStorage.getItem()

    if (!options[node]) {
      options[node] = {
        node: { useFastest: false },
        service: { useFastest: true }
      }
    }
    if (!options[node][kind]) {
      options[node][kind] = { useFastest: false }
    }

    options[node][kind].useFastest = value

    optionsStorage.setItem(options)
  }
}
