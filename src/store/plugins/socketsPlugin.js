import socketClient from '@/lib/sockets'
import { decodeChat, getPublicKey } from '@/lib/adamant-api'
import { isStringEqualCI } from '@/lib/textHelpers'
import { MessageType } from '@/lib/constants'

function subscribe(store) {
  socketClient.subscribe('newMessage', (transaction) => {
    const promise = isStringEqualCI(transaction.recipientId, store.state.address)
      ? Promise.resolve(transaction.senderPublicKey)
      : getPublicKey(transaction.recipientId)

    promise.then((publicKey) => {
      const decoded = transaction.type === 0 ? transaction : decodeChat(transaction, publicKey)

      // All transactions we get via socket are shown in chats, including ADM direct transfers
      // Currently, we don't update confirmations for direct transfers, see getChats() in adamant-api.js
      // So we'll update confirmations in getTransactionStatus()

      if (transaction.asset?.chat?.type !== MessageType.SIGNAL_MESSAGE) {
        store.dispatch('chat/pushMessages', [decoded])
      }
    })
  })
}

export default (store) => {
  subscribe(store)

  socketClient.setSocketEnabled(store.state.options.useSocketConnection)

  // open socket connection when chats are loaded
  store.watch(
    () => store.state.chat.isFulfilled,
    (isFulfilled) => {
      if (isFulfilled) socketClient.init(store.state.address)
    }
  )

  // when logout or update `useSocketConnection` option
  store.subscribe((mutation) => {
    if (mutation.type === 'reset') socketClient.destroy()

    if (
      mutation.type === 'options/updateOption' &&
      mutation.payload.key === 'useSocketConnection'
    ) {
      socketClient.setSocketEnabled(mutation.payload.value)
    }
  })

  // when statusUpdate/enable/disable/useFastest node
  store.subscribe((mutation) => {
    if (mutation.type === 'nodes/status' || mutation.type === 'nodes/toggle') {
      socketClient.setNodes(store.getters['nodes/adm'])
    }

    if (mutation.type === 'nodes/useFastest') {
      socketClient.setUseFastest(mutation.payload)
    }
  })
}
