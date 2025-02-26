import { FetchStatus } from '@/lib/constants'
import baseActions from '../btc-base/btc-base-actions'
import BtcApi from '../../../lib/bitcoin/bitcoin-api'
import { btcIndexer } from '../../../lib/nodes'

const TX_CHUNK_SIZE = 25

const customActions = (getApi) => ({
  updateStatus(context) {
    const api = getApi()

    if (!api) return
    btcIndexer
      .getBalance(context.state.address)
      .then((balance) => {
        context.commit('status', { balance })
        context.commit('setBalanceStatus', FetchStatus.Success)
      })
      .catch((err) => {
        context.commit('setBalanceStatus', FetchStatus.Error)
        console.warn(err)
      })

    // The unspent transactions are needed to estimate the fee
    btcIndexer
      .getUnspents(context.state.address)
      .then((utxo) => context.commit('utxo', utxo))
      .catch((err) => console.warn(err))

    // The estimated fee rate is also needed
    btcIndexer
      .getFeeRate()
      .then((rate) => context.commit('feeRate', rate['2']))
      .catch((err) => console.warn(err))

    // Last block height
    context.dispatch('updateHeight')
  },

  updateHeight({ commit }) {
    const api = getApi()
    if (!api) return

    btcIndexer
      .getHeight()
      .then((height) => commit('height', height))
      .catch((err) => console.warn(err))
  }
})

const retrieveNewTransactions = async (api, context, latestTxId, toTx) => {
  const transactions = await btcIndexer.getTransactions(context.state.address, toTx)
  context.commit('transactions', transactions)

  if (latestTxId && !transactions.some((x) => x.txid === latestTxId)) {
    const oldest = transactions[transactions.length - 1]
    await getNewTransactions(api, context, latestTxId, oldest && oldest.txid)
  }
}

const getNewTransactions = async (api, context) => {
  context.commit('areRecentLoading', true)
  // Determine the most recent transaction ID
  const latestTransaction = context.getters.sortedTransactions[0]
  const latestId = latestTransaction && latestTransaction.txid
  // Now fetch the transactions until we meet that latestId among the
  // retrieved results
  await retrieveNewTransactions(api, context, latestId)
  context.commit('areRecentLoading', false)
}

const getOldTransactions = async (api, context) => {
  // If we already have the most old transaction for this address, no need to request anything
  if (context.state.bottomReached) return Promise.resolve()

  const transactions = context.getters.sortedTransactions
  const oldestTx = transactions[transactions.length - 1]
  const toTx = oldestTx && oldestTx.txid

  context.commit('areOlderLoading', true)
  const chunk = await btcIndexer.getTransactions(context.state.address, toTx)
  context.commit('transactions', chunk)
  context.commit('areOlderLoading', false)

  if (chunk.length < TX_CHUNK_SIZE) {
    context.commit('bottom', true)
  }
}

export default {
  ...baseActions({
    apiCtor: BtcApi,
    getOldTransactions,
    getNewTransactions,
    customActions
  })
}
