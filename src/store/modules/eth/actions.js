import * as utils from '../../../lib/eth-utils'
import createActions from '../eth-base/eth-base-actions'

import {
  DEFAULT_ETH_TRANSFER_GAS_LIMIT,
  FetchStatus,
  INCREASE_FEE_MULTIPLIER
} from '@/lib/constants'
import { storeCryptoAddress } from '@/lib/store-crypto-address'

/** Timestamp of the most recent status update */
let lastStatusUpdate = 0
/** Status update interval is 25 sec: ETH balance, gas price, last block height */
const STATUS_INTERVAL = 25000

/**
 * Stores ETH address to the ADAMANT KVS if it's not there yet
 * @param {*} context
 */
function storeEthAddress(context) {
  storeCryptoAddress(context.state.crypto, context.state.address)
}

const initTransaction = async (api, context, ethAddress, amount, increaseFee) => {
  const nonce = await api.getTransactionCount(context.state.address)
  const gasPrice = await api.getGasPrice()

  const transaction = {
    from: context.state.address,
    to: ethAddress,
    value: BigInt(utils.toWei(amount)),
    gasPrice,
    nonce
  }

  const gasLimit = await api
    .estimateGas(transaction)
    .catch(() => BigInt(DEFAULT_ETH_TRANSFER_GAS_LIMIT))
  transaction.gasLimit = increaseFee ? gasLimit * BigInt(INCREASE_FEE_MULTIPLIER) : gasLimit

  return transaction
}

const parseTransaction = (context, tx) => {
  return {
    hash: tx.hash,
    senderId: tx.from,
    recipientId: tx.to,
    amount: utils.toEther(tx.value.toString(10)),
    fee: utils.calculateFee(tx.gas, (tx.gasPrice || tx.effectiveGasPrice).toString(10)),
    status: tx.blockNumber ? 'CONFIRMED' : 'PENDING',
    blockNumber: Number(tx.blockNumber),
    gasPrice: Number(tx.gasPrice || tx.effectiveGasPrice)
  }
}

const createSpecificActions = (api) => ({
  updateBalance: {
    root: true,
    async handler({ state, commit }, payload = {}) {
      if (payload.requestedByUser) {
        commit('setBalanceStatus', FetchStatus.Loading)
      }

      try {
        const rawBalance = await api.getBalance(state.address, 'latest')
        const balance = Number(utils.toEther(rawBalance.toString()))

        commit('balance', balance)
        commit('setBalanceStatus', FetchStatus.Success)
      } catch (err) {
        commit('setBalanceStatus', FetchStatus.Error)
        console.log(err)
      }
    }
  },

  /**
   * Requests ETH account status: balance, gas price, last block height
   * @param {*} context Vuex action context
   */
  updateStatus(context) {
    if (!context.state.address) return

    // Balance
    void api.getBalance(context.state.address, 'latest').then((balance) => {
      context.commit('balance', Number(utils.toEther(balance.toString())))
      context.commit('setBalanceStatus', FetchStatus.Success)
    })

    // Current gas price
    void api.getGasPrice().then((price) => {
      context.commit('gasPrice', {
        gasPrice: Number(price),
        fee: +(+utils.calculateFee(DEFAULT_ETH_TRANSFER_GAS_LIMIT, price)).toFixed(8)
      })
    })

    // Current block number
    void api.getBlockNumber().then((number) => {
      context.commit('blockNumber', Number(number))
    })

    const delay = Math.max(0, STATUS_INTERVAL - Date.now() + lastStatusUpdate)
    setTimeout(() => {
      if (context.state.address) {
        lastStatusUpdate = Date.now()
        context.dispatch('updateStatus')
      }
    }, delay)
  }
})

export default createActions({
  onInit: storeEthAddress,
  initTransaction,
  parseTransaction,
  createSpecificActions
})
