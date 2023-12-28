import VuexPersistence from 'vuex-persist'
import { RootState } from '@/store/types.ts'

const walletsPersistencePlugin = new VuexPersistence({
  key: 'adm-wallets',
  storage: window.localStorage,
  reducer: (state: RootState) => {
    return {
      symbols: state.wallets.symbols,
      version: state.wallets.version
    }
  }
})

export default walletsPersistencePlugin.plugin
