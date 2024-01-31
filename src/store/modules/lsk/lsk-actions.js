import { FetchStatus } from '@/lib/constants'
import baseActions from '../lsk-base/lsk-base-actions'
import { lsk } from '../../../lib/nodes/lsk'
import shouldUpdate from '../../utils/coinUpdatesGuard'

const TX_FETCH_INTERVAL = 10 * 1000

const customActions = (getAccount) => ({
  updateBalance: {
    root: true,
    async handler({ commit, rootGetters, state }, payload = {}) {
      const coin = state.crypto

      if (!shouldUpdate(() => rootGetters['wallets/getVisibility'](coin))) {
        console.log(`%cDO NOT UPDATE BALANCE FOR ${coin}`, 'background: #444; color: #f00')
        return
      }
      console.log(`%cUPDATE BALANCE FOR ${coin}`, 'background: #444; color: #0f0')

      if (payload.requestedByUser) {
        commit('setBalanceStatus', FetchStatus.Loading)
      }

      try {
        const balance = await lsk.getBalance(state.address)
        const nonce = await lsk.getNonce(state.address)

        commit('status', { balance, nonce })
        commit('setBalanceStatus', FetchStatus.Success)
      } catch (err) {
        commit('setBalanceStatus', FetchStatus.Error)
        console.log(err)
      }
    }
  },

  async updateStatus({ commit, dispatch }) {
    const account = getAccount()
    if (!account) return

    const address = account.getLisk32Address()

    try {
      const balance = await lsk.getBalance(address)
      const nonce = await lsk.getNonce(address)

      commit('status', { balance, nonce })
      commit('setBalanceStatus', FetchStatus.Success)
    } catch (err) {
      commit('setBalanceStatus', FetchStatus.Error)

      throw err
    }

    // Last block height
    dispatch('updateHeight')
  },

  async updateHeight({ commit }) {
    const height = await lsk.getHeight()

    commit('height', height)
  },

  /**
   * Updates the transaction details
   * @param {{ dispatch: function, getters: object }} param0 Vuex context
   * @param {{hash: string}} payload action payload
   */
  updateTransaction({ dispatch, getters }, payload) {
    const tx = getters.transaction(payload.hash)

    if (tx && (tx.status === 'CONFIRMED' || tx.status === 'REJECTED')) {
      // If transaction is in one of the final statuses (either succeeded or failed),
      // just update the current height to recalculate its confirmations counter.
      return dispatch('updateHeight')
    } else {
      // Otherwise fetch the transaction details
      return dispatch('getTransaction', {
        ...payload,
        force: payload.force,
        updateOnly: payload.updateOnly
      })
    }
  }
})

export default {
  ...baseActions({
    customActions,
    fetchRetryTimeout: TX_FETCH_INTERVAL
  })
}
