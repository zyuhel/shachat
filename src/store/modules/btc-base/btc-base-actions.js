import BigNumber from '@/lib/bignumber'
import BtcBaseApi from '@/lib/bitcoin/btc-base-api'
import { FetchStatus } from '@/lib/constants'
import { nodes } from '@/lib/nodes'
import {
  assertNoPendingTransaction,
  createPendingTransaction,
  invalidatePendingTransaction,
  PendingTxStore
} from '@/lib/pending-transactions'
import { storeCryptoAddress } from '@/lib/store-crypto-address'
import shouldUpdate from '@/store/utils/coinUpdatesGuard'

const DEFAULT_CUSTOM_ACTIONS = () => ({})

/**
 * @typedef {Object} Options
 * @property {function} apiCtor class to use for interaction with the crypto API
 * @property {function(BtcBaseApi, object): Promise} getNewTransactions function to get the new transactions list (second arg is a Vuex context)
 * @property {function(BtcBaseApi, object): Promise} getOldTransactions function to get the old transactions list (second arg is a Vuex context)
 * @property {function(function(): BtcBaseApi): object} customActions function to create custom actions for the current crypto (optional)
 * @property {number} fetchRetryTimeout interval (ms) between attempts to fetch the registered transaction details
 */

/**
 * Creates actions for the BTC-based crypto
 * @param {Options} options config options
 */
function createActions(options) {
  const Api = options.apiCtor || BtcBaseApi
  const { getNewTransactions, getOldTransactions, customActions = DEFAULT_CUSTOM_ACTIONS } = options

  /** @type {BtcBaseApi} */
  let api = null

  return {
    afterLogin: {
      root: true,
      handler(context, passphrase) {
        api = new Api(passphrase)
        context.commit('address', api.address)
        context.dispatch('updateStatus')
        context.dispatch('storeAddress')

        // restore pending transaction
        const pendingTransaction = PendingTxStore.get(context.state.crypto)
        if (pendingTransaction) {
          context.commit('transactions', [pendingTransaction])
        }
      }
    },

    /** Resets module state */
    reset: {
      root: true,
      handler(context) {
        api = null
        context.commit('reset')
      }
    },

    /** Handles store rehydratation: generates an account if one is not ready yet */
    rehydrate: {
      root: true,
      handler(context) {
        const passphrase = context.rootGetters.getPassPhrase
        if (passphrase) {
          api = new Api(passphrase)
          context.commit('address', api.address)
          context.dispatch('updateStatus')
          context.dispatch('storeAddress')
        }
      }
    },

    /**
     * @param requestedByUser If `true` then user requested balance update through UI
     * @returns {Promise<void>}
     */
    updateBalance: {
      root: true,
      async handler({ commit, rootGetters, state }, payload = {}) {
        const coin = state.crypto

        if (!shouldUpdate(() => rootGetters['wallets/getVisibility'](coin))) {
          return
        }

        if (payload.requestedByUser) {
          commit('setBalanceStatus', FetchStatus.Loading)
        }

        try {
          const balance = await api.getBalance()

          commit('status', { balance })
          commit('setBalanceStatus', FetchStatus.Success)
        } catch (err) {
          commit('setBalanceStatus', FetchStatus.Error)
          console.warn(err)
        }
      }
    },

    storeAddress({ state }) {
      storeCryptoAddress(state.crypto, state.address)
    },

    updateStatus(context) {
      if (!api) return
      api
        .getBalance()
        .then((balance) => {
          context.commit('status', { balance })
          context.commit('setBalanceStatus', FetchStatus.Success)
        })
        .catch((err) => {
          context.commit('setBalanceStatus', FetchStatus.Error)
          console.warn(err)
        })
    },

    async sendTokens(context, { amount, admAddress, address, comments, fee, replyToId }) {
      if (!api) return
      address = address.trim()

      const crypto = context.state.crypto
      const nodeName = crypto.toLowerCase()

      // 1. Check nodes availability
      if (admAddress) {
        await nodes.adm.assertAnyNodeOnline()
      }
      await nodes[nodeName].assertAnyNodeOnline()

      // 2. Invalidate previous pending transaction if finalized
      await invalidatePendingTransaction(crypto, async (hashLocal) => {
        const transaction = await api.getTransaction(hashLocal)
        return !!transaction && transaction.confirmations > 0
      })

      // 3. Sign transaction offline
      const signedTransaction = await api.createTransaction(address, amount, fee)

      // 4. Ensure there is no pending transaction (skipped, no nonce in BTC like cryptos)
      await assertNoPendingTransaction(context.state.crypto, 0)

      // 5. Send crypto transfer message to ADM blockchain (if ADM address provided)
      if (admAddress) {
        const msgPayload = {
          address: admAddress,
          amount: BigNumber(amount).toFixed(),
          comments,
          crypto,
          hash: signedTransaction.txid,
          replyToId
        }
        // Send a special message to indicate that we're performing a crypto transfer
        const success = await context.dispatch('sendCryptoTransferMessage', msgPayload, {
          root: true
        })
        if (!success) {
          throw new Error('adm_message')
        }
      }

      // 6. Save pending transaction
      const pendingTransaction = createPendingTransaction({
        hash: signedTransaction.txid,
        senderId: context.state.address,
        recipientId: address,
        amount,
        fee
      })
      await PendingTxStore.save(context.state.crypto, pendingTransaction)
      context.commit('transactions', [pendingTransaction])

      // 7. Send signed transaction to the blockchain
      try {
        const hash = await api.sendTransaction(signedTransaction.hex)
        console.log(
          `${crypto} transaction has been sent: localHash: ${signedTransaction.txid}, responseHash: ${hash}`
        )

        context.commit('transactions', [
          {
            hash,
            senderId: context.state.address,
            recipientId: address,
            amount,
            fee,
            status: 'PENDING'
          }
        ])

        return hash
      } catch (error) {
        context.commit('transactions', [{ hash: signedTransaction.txid, status: 'REJECTED' }])
        PendingTxStore.remove(context.state.crypto)
        throw error
      }
    },

    getNewTransactions(context) {
      if (api && typeof getNewTransactions === 'function') {
        return getNewTransactions(api, context)
      }
      return Promise.resolve()
    },

    getOldTransactions(context) {
      if (api && typeof getOldTransactions === 'function') {
        return getOldTransactions(api, context)
      }
      return Promise.resolve()
    },

    ...customActions(() => api)
  }
}

export default createActions
