import { createStore } from 'vuex'
import { Base64 } from 'js-base64'

import {
  unlock,
  loginOrRegister,
  loginViaPassword,
  sendSpecialMessage,
  getCurrentAccount
} from '@/lib/adamant-api'
import { Fees, FetchStatus } from '@/lib/constants'
import { encryptPassword } from '@/lib/idb/crypto'
import { flushCryptoAddresses, validateStoredCryptoAddresses } from '@/lib/store-crypto-address'
import { registerCryptoModules } from './utils/registerCryptoModules'
import { registerVuexPlugins } from './utils/registerVuexPlugins'
import sessionStoragePlugin from './plugins/sessionStorage'
import localStoragePlugin from './plugins/localStorage'
import indexedDbPlugin from './plugins/indexedDb'
import navigatorOnline from './plugins/navigatorOnline'
import socketsPlugin from './plugins/socketsPlugin'
import partnersModule from './modules/partners'
import admModule from './modules/adm'
import attachmentModule from './modules/attachment'
import botCommandsModule from './modules/bot-commands'
import bitcoinModule from './modules/btc'
import dashModule from './modules/dash'
import delegatesModule from './modules/delegates'
import dogeModule from './modules/doge'
import klyModule from './modules/kly'
import nodesModule from './modules/nodes'
import walletsModule from './modules/wallets'
import nodesPlugin from './modules/nodes/nodes-plugin'
import walletsPersistencePlugin from './modules/wallets/wallets-plugin'
import botCommandsPlugin from './modules/bot-commands/bot-commands-plugin'
import draftMessage from '@/store/modules/draft-message'
import snackbar from './modules/snackbar'
import language from './modules/language'
import chat from './modules/chat'
import options from './modules/options'
import identicon from './modules/identicon'
import notification from './modules/notification'
import cache from '@/store/cache'
import rate from './modules/rate'
import { cryptoTransferAsset, replyWithCryptoTransferAsset } from '@/lib/adamant-api/asset'
import { PendingTxStore } from '@/lib/pending-transactions'
import servicesModule from './modules/services'
import servicesPlugin from './modules/services/services-plugin'

export let interval

const UPDATE_BALANCE_INTERVAL = 5000
const UPDATE_BALANCE_INTERVAL_FOR_NEW_ACCOUNT = 1500

/**
 * @type { import("vuex").StoreOptions } store
 */
const store = {
  state: () => ({
    IDBReady: false, // set `true` when state has been saved in IDB
    address: '',
    balance: 0,
    unconfirmedBalance: 0,
    balanceStatus: FetchStatus.Loading,
    passphrase: '',
    password: '',
    publicKeys: {},
    isOnline: true
  }),
  getters: {
    isLogged: (state) => state.passphrase.length > 0,
    isOnline: (state) => state.isOnline,
    getPassPhrase: (state) => state.passphrase, // compatibility getter for ERC20 modules
    publicKey: (state) => (adamantAddress) => state.publicKeys[adamantAddress],
    isAccountNew: (state) =>
      function () {
        /*
        It is hard to detect if account is new or not. Let's say:
        ADM Balance = 0. But old accounts can also have 0 balance
        ADM transactions count = 0. But any account has 0 transactions in store just after login, before user goes to Tx list screen
        chat.lastMessageHeight = 0. App stores a height of last message
        Checking chat.transactions is not effective. There are static chats in any new account.
      */
        return (
          state.balance === 0 &&
          state.unconfirmedBalance === 0 &&
          state.chat.lastMessageHeight === 0 &&
          Object.keys(state.adm.transactions).length === 0
        )
      }
  },
  mutations: {
    setAddress(state, address) {
      state.address = address
    },
    setBalance(state, balance) {
      state.balance = balance
    },
    setUnconfirmedBalance(state, balance) {
      state.unconfirmedBalance = balance
    },
    setBalanceStatus(state, status) {
      state.balanceStatus = status
    },
    setPassphrase(state, passphrase) {
      state.passphrase = Base64.encode(passphrase)
    },
    setPassword(state, password) {
      state.password = password
    },
    resetPassword(state) {
      state.password = ''
    },
    setIDBReady(state, value) {
      state.IDBReady = value
    },
    reset(state) {
      state.address = ''
      state.balance = 0
      state.passphrase = ''
      state.password = ''
      state.IDBReady = false
      state.publicKeys = {}
      cache.resetCachedSeed()
    },
    setPublicKey(state, { adamantAddress, publicKey }) {
      state.publicKeys[adamantAddress] = publicKey
    },
    setIsOnline(state, value) {
      state.isOnline = value
    }
  },
  actions: {
    login({ commit, dispatch }, passphrase) {
      // First, clear previous account data, if it exists. Calls resetState(state, getInitialState()) also
      dispatch('reset')

      return loginOrRegister(passphrase).then((account) => {
        commit('setAddress', account.address)
        commit('setBalance', account.balance)
        commit('setUnconfirmedBalance', account.unconfirmedBalance)
        commit('setPassphrase', passphrase)

        // retrieve wallet data
        dispatch('afterLogin', passphrase)
      })
    },
    loginViaPassword({ commit, dispatch }, password) {
      return loginViaPassword(password, this).then((account) => {
        commit('setIDBReady', true)

        // retrieve wallet data
        dispatch('afterLogin', account.passphrase)
      })
    },
    logout({ dispatch }) {
      dispatch('reset')
      dispatch('wallets/initWalletsSymbols')
      dispatch('draftMessage/resetState', null, { root: true })
      PendingTxStore.clear()
    },
    unlock({ state, dispatch }) {
      // user updated an app, F5 or something
      const passphrase = Base64.decode(state.passphrase)

      unlock(passphrase)

      // retrieve wallet data only if loginViaPassword, otherwise coin modules will be loaded twice
      if (state.password) {
        dispatch('afterLogin', passphrase)
      }
    },
    sendCryptoTransferMessage(context, payload) {
      const transferPayload = {
        cryptoSymbol: payload.crypto,
        amount: payload.amount,
        hash: payload.hash,
        comments: payload.comments
      }

      const asset = payload.replyToId
        ? replyWithCryptoTransferAsset(payload.replyToId, transferPayload)
        : cryptoTransferAsset(transferPayload)

      return sendSpecialMessage(payload.address, asset).then((result) => {
        if (!result.success) {
          throw new Error(`Failed to send "${asset.type}"`)
        }
        return result.success
      })
    },
    reset({ commit }) {
      commit('reset', null, { root: true })
    },
    setPassword({ commit }, password) {
      return encryptPassword(password).then((encryptedPassword) => {
        commit('setPassword', encryptedPassword)

        return encryptedPassword
      })
    },
    removePassword({ commit }) {
      commit('resetPassword')
      commit('setIDBReady', false)
      commit('options/updateOption', { key: 'stayLoggedIn', value: false })
    },
    updateBalance({ commit }, payload = {}) {
      if (payload.requestedByUser) {
        commit('setBalanceStatus', FetchStatus.Loading)
      }

      return getCurrentAccount()
        .then((account) => {
          commit('setBalance', account.balance)
          commit('setUnconfirmedBalance', account.unconfirmedBalance)
          commit('setBalanceStatus', FetchStatus.Success)
          if (account.balance > Fees.KVS) {
            flushCryptoAddresses()
          }
        })
        .catch((err) => {
          commit('setBalanceStatus', FetchStatus.Error)
          throw err
        })
    },

    startInterval: {
      root: true,
      handler({ dispatch, getters }) {
        function repeat() {
          validateStoredCryptoAddresses()
          dispatch('updateBalance')
            .catch((err) => console.error(err))
            .then(
              () =>
                (interval = setTimeout(
                  repeat,
                  getters.isAccountNew()
                    ? UPDATE_BALANCE_INTERVAL_FOR_NEW_ACCOUNT
                    : UPDATE_BALANCE_INTERVAL
                ))
            )
        }
        repeat()
      }
    },

    stopInterval: {
      root: true,
      handler() {
        clearTimeout(interval)
      }
    }
  },
  modules: {
    adm: admModule, // ADM transfers
    attachment: attachmentModule, // Files and photos attachments
    doge: dogeModule,
    kly: klyModule,
    dash: dashModule,
    btc: bitcoinModule,
    partners: partnersModule, // Partners: display names, crypto addresses and so on
    delegates: delegatesModule, // Voting for delegates screen
    nodes: nodesModule, // ADAMANT nodes
    botCommands: botCommandsModule,
    snackbar,
    draftMessage,
    language,
    chat,
    options,
    identicon,
    notification,
    rate,
    services: servicesModule,
    wallets: walletsModule // Wallets order and visibility
  }
}

const storeInstance = createStore(store)
window.store = storeInstance

// Need to init persistence plugin before other, because they use info from wallets
registerVuexPlugins(storeInstance, [
  walletsPersistencePlugin,
])

registerCryptoModules(storeInstance)
registerVuexPlugins(storeInstance, [
  nodesPlugin,
  sessionStoragePlugin,
  localStoragePlugin,
  indexedDbPlugin,
  navigatorOnline,
  socketsPlugin,
  botCommandsPlugin,
  servicesPlugin
])

export { store } // for tests

export default storeInstance
