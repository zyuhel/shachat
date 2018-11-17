import * as admApi from '../../../lib/adamant-api'
import i18n from '../../../i18n'
import Vue from 'vue'
import utils from '../../../lib/adamant'

export default {

  /** Starts background sync after login */
  afterLogin: {
    root: true,
    handler (context) {
      const address = context.rootState.address
      context.commit('address', address)
    }
  },

  /** Resets module state */
  reset: {
    root: true,
    handler (context) {
      context.commit('reset')
    }
  },

  /** Handles store rehydratation */
  rehydrate: {
    root: true,
    handler (context) {
      const address = context.rootState.address
      context.commit('address', address)
    }
  },

  /**
   * Retrieves new transactions: those that follow the most recently retrieved one.
   * @param {any} context Vuex action context
   */
  getNewTransactions (context) {
    const options = { }
    if (context.state.maxHeight > 0) {
      options.from = context.state.maxHeight + 1
    }

    return admApi.getTransactions(options).then(response => {
      if (Array.isArray(response.transactions) && response.transactions.length) {
        let chats = context.rootGetters.getChats
        response.transactions.forEach(tx => {
          for (let chat in chats) {
            let chatItem = chats[chat]
            for (let message in chatItem.messages) {
              let messageItem = chatItem.messages[message].id
              if (messageItem === tx.id) {
                Vue.set(chatItem.messages, tx.id, {
                  ...chats[tx.recipientId].messages[tx.id],
                  confirm_class: 'confirmed'
                })
                if (chatItem.last_message.id === tx.id) {
                  chatItem.last_message.confirm_class = 'confirmed'
                }
              } else {
                if (tx.senderId === chat) {
                  Vue.set(chats[chat], 'last_message', {
                    ...chats[chat].last_message,
                    message: i18n.t('chats.received_label') + ' ' + tx.amount / 100000000 + ' ADM',
                    confirm_class: 'confirmed',
                    timestamp: utils.epochTime()
                  })
                }
              }
            }
          }
        })
        context.commit('transactions', response.transactions)
      }
    })
  },

  /**
   * Retrieves new transactions: those that preceed the oldest among the retrieved ones.
   * @param {any} context Vuex action context
   */
  getOldTransactions (context) {
    // If we already have the most old transaction for this address, no need to request anything
    if (context.state.bottomReached) return Promise.resolve()

    const options = { }
    if (context.state.minHeight > 1) {
      options.to = context.state.minHeight - 1
    }

    return admApi.getTransactions(options).then(response => {
      const hasResult = Array.isArray(response.transactions) && response.transactions.length

      if (hasResult) {
        context.commit('transactions', response.transactions)
      }

      // Successful but empty response means, that the oldest transaction for the current
      // address has been received already
      if (response.success && !hasResult) {
        context.commit('bottom')
      }
    })
  },

  /**
   * Retrieves transaction info.
   * @param {any} context Vuex action context
   * @param {string} id transaction ID
   */
  getTransaction (context, id) {
    admApi.getTransaction(id).then(
      transaction => context.commit('transactions', [transaction])
    )
  }
}
