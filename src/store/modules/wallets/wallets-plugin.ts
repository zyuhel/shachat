import VuexPersistence from 'vuex-persist'
import { mapWallets } from '@/store/modules/wallets/utils'
import { WalletsState } from '@/store/modules/wallets/types'
import { TypedStorage } from '@/lib/typed-storage'

const WALLETS_STATE_STORAGE_KEY = 'WALLETS_STATE_STORAGE'

const stateStorage = new TypedStorage<typeof WALLETS_STATE_STORAGE_KEY, WalletsState | null>(
  WALLETS_STATE_STORAGE_KEY,
  null,
  window.localStorage
)
function initWallets() {
  let state = stateStorage.getItem()

  if (!state) {
    state = { symbols: mapWallets() }
    stateStorage.setItem(state)
  } else {
    const initialTemplate = mapWallets()

    const hasDifference = !!initialTemplate.filter(
      ({ symbol: symbol1 }) => !state!.symbols.some(({ symbol: symbol2 }) => symbol2 === symbol1)
    ).length

    if (hasDifference) {
      state.symbols = mapWallets()
      stateStorage.setItem(state)
    }
  }
}
initWallets()

const walletsPersistencePlugin = new VuexPersistence({
  key: WALLETS_STATE_STORAGE_KEY,
  restoreState: (key, storage) => {
    let wallets = {}
    if (storage) {
      const stateFromLS = stateStorage.getItem()
      if (stateFromLS?.symbols) {
        wallets = stateFromLS
      }
    }

    return {
      wallets
    }
  },
  saveState: (key, state: Record<string, WalletsState>, storage) => {
    storage!.setItem(
      key,
      JSON.stringify({
        symbols: state.wallets.symbols
      })
    )
  },
  filter: (mutation) => {
    return (
      mutation.type === 'wallets/updateVisibility' || mutation.type === 'wallets/setWalletSymbols'
    )
  }
})

export default walletsPersistencePlugin.plugin
