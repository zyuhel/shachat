import { MutationTree } from 'vuex'
import { Rates, RateState } from '@/store/modules/rate/types.ts'

export const mutations: MutationTree<RateState> = {
  setRates(state, rates: Rates) {
    state.rates = rates
  },
  setHistoryRates(state, historyRates: { name: number; value: Rates }) {
    state.historyRates[historyRates.name] = historyRates.value
  },
  loadRates(state) {
    state.isLoaded = true
  }
}