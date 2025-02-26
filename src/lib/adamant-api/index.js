import Queue from 'promise-queue'
import { Base64 } from 'js-base64'

import { Transactions, Delegates, MessageType } from '@/lib/constants'
import utils from '@/lib/adamant'
import client from '@/lib/nodes/adm'
import { encryptPassword } from '@/lib/idb/crypto'
import { restoreState } from '@/lib/idb/state'
import { i18n } from '@/i18n'
import store from '@/store'
import { isStringEqualCI } from '@/lib/textHelpers'
import { parseCryptoAddressesKVStxs } from '@/lib/store-crypto-address'

Queue.configure(Promise)

/** Promises queue to execute them sequentially */
const queue = new Queue(1, Infinity)

/** @type {{privateKey: Buffer, publicKey: Buffer}} */
let myKeypair = {}
let myAddress = null

/** Lists cryptos for which addresses are currently being stored to the KVS */
const pendingAddresses = {}
export const TX_CHUNK_SIZE = 25

/**
 * Creates a new transaction with the common fields pre-filled
 * @param {number} type transaction type
 * @returns {{type: number, senderId: string, senderPublicKey: string, timestamp: number}}
 */
function newTransaction(type) {
  return {
    type,
    amount: 0,
    senderId: myAddress,
    senderPublicKey: myKeypair.publicKey.toString('hex')
  }
}

/**
 * Sets transaction timestamp and signature and returns it.
 * @param {object} transaction ADM transaction
 * @param {number} timeDelta server endpoint time delta
 * @returns {object}
 */
function signTransaction(transaction, timeDelta) {
  if (transaction.signature) {
    delete transaction.signature
  }

  transaction.timestamp = utils.epochTime() - timeDelta
  transaction.signature = utils.transactionSign(transaction, myKeypair)

  return transaction
}

export function unlock(passphrase) {
  const hash = utils.createPassphraseHash(passphrase)
  myKeypair = utils.makeKeypair(hash)
  myAddress = utils.getAddressFromPublicKey(myKeypair.publicKey)
  return myAddress
}

/**
 * Retrieves current account details, creating it if necessary.
 * @returns {Promise<any>}
 */
export function getCurrentAccount() {
  const publicKey = myKeypair.publicKey.toString('hex')

  return client
    .get('/api/accounts', { publicKey })
    .then((response) => {
      if (response.success) {
        return response.account
      } else if (response.error === 'Account not found') {
        // Create account if it does not yet exist
        return client.post('/api/accounts/new', { publicKey }).then((response) => {
          if (response.error) throw new Error(response.error)
          response.account.isNew = true
          return response.account
        })
      }

      throw new Error(response.error)
    })
    .then((account) => {
      account.balance = utils.toAdm(account.balance)
      account.unconfirmedBalance = utils.toAdm(account.unconfirmedBalance)
      account.publicKey = myKeypair.publicKey
      return account
    })
}

/**
 * Returns `true` if API client is unlocked and ready to process requests. *
 * @returns {Boolean}
 */
export function isReady() {
  return Boolean(myAddress && myKeypair)
}

/**
 * Retrieves user public key by his address
 * @param {string} address ADM address
 * @returns {Promise<string>}
 */
export function getPublicKey(address = '') {
  const publicKeyCached = store.getters.publicKey(address)

  if (publicKeyCached) {
    return Promise.resolve(publicKeyCached)
  }

  return client.get('/api/accounts/getPublicKey', { address }).then((response) => {
    const publicKey = response.publicKey

    if (publicKey) {
      store.commit('setPublicKey', {
        adamantAddress: address,
        publicKey
      })

      return publicKey
    }

    throw new Error(i18n.global.t('chats.no_public_key'))
  })
}

/**
 * @typedef {Object} MsgParams
 * @property {string} to target address
 * @property {string|object} message message to send (object value will be JSON-serialized)
 * @property {number} type 1 for a regular message, 2 for a special one
 * @property {number} amount ADMs to send with this message
 */

/**
 * Sends message with the specified payload
 * @param {{
 *   to: string,
 *   message?: string | any,
 *   type?: number,
 *   amount?: number
 * }} params
 * @returns {Promise<{success: boolean, transactionId: string}>}
 */
export function sendMessage(params) {
  return getPublicKey(params.to)
    .then((publicKey) => {
      const text =
        typeof params.message === 'string' ? params.message : JSON.stringify(params.message)
      const encoded = utils.encodeMessage(text, publicKey, myKeypair.privateKey)
      const chat = {
        message: encoded.message,
        own_message: encoded.nonce,
        type: params.type || 1
      }

      const transaction = newTransaction(Transactions.CHAT_MESSAGE)
      transaction.amount = params.amount ? utils.prepareAmount(params.amount) : 0
      transaction.asset = { chat }
      transaction.recipientId = params.to

      return client.post('/api/chats/process', (endpoint) => {
        return { transaction: signTransaction(transaction, endpoint.timeDelta) }
      })
    })
    .catch((reason) => {
      return reason
    })
}

/**
 * @param {Uint8Array} file
 * @param {{ to: string }} params
 */
export async function encodeFile(file, params) {
  const publicKey = await getPublicKey(params.to)
  const { binary, nonce } = utils.encodeBinary(file, publicKey, myKeypair.privateKey)

  return { binary, nonce }
}

/**
 * Sends special message with the specified payload
 * @param {string} to recipient address
 * @param {object} payload message payload
 */
export function sendSpecialMessage(to, payload) {
  return sendMessage({ to, message: payload, type: MessageType.RICH_CONTENT_MESSAGE })
}

/**
 * Stores the supplied value into the Adamant KVS under the specified key.
 * @param {string} key key for the stored value
 * @param {any} value value to store
 * @returns {Promise<{success: boolean}>}
 */
export function storeValue(key, value, encode = false) {
  if (encode) {
    const encoded = utils.encodeValue(value, myKeypair.privateKey)
    value = JSON.stringify(encoded)
  }

  const transaction = newTransaction(Transactions.STATE)
  transaction.asset = { state: { key, value, type: 0 } }
  return client.post('/api/states/store', (endpoint) => {
    return { transaction: signTransaction(transaction, endpoint.timeDelta) }
  })
}

function tryDecodeStoredValue(value) {
  let json = null
  try {
    json = JSON.parse(value)
  } catch (e) {
    // Not a JSON => not an encoded value
    return value
  }

  if (json.nonce) {
    try {
      return utils.decodeValue(json.message, myKeypair.privateKey, json.nonce)
    } catch (e) {
      console.warn('Failed to parse encoded value', e)
      throw e
    }
  }

  return json
}

/**
 * Retrieves the stored value from the Adamant KVS or array of KVS transactions
 * @param {string} key key in the KVS
 * @param {string=} ownerAddress ADM address of the value owner
 * @param {number} records if > 1, returns array of KVS transactions
 * @returns {Promise<any>}
 */
export function getStored(key, ownerAddress, records = 1) {
  if (!ownerAddress) {
    ownerAddress = myAddress
  }

  const params = {
    senderId: ownerAddress,
    key,
    orderBy: 'timestamp:desc',
    limit: records
  }

  return client.get('/api/states/get', params).then((response) => {
    let value = null

    if (response.success && Array.isArray(response.transactions)) {
      if (records > 1) {
        // Return all records
        // It may be an empty array; f. e., in case of no crypto addresses stored for a currency
        return response.transactions
      } else {
        const tx = response.transactions[0]
        value = tx && tx.asset && tx.asset.state && tx.asset.state.value
        return tryDecodeStoredValue(value)
      }
    }

    return null
  })
}

/**
 * Sends the specified amount of ADM to the specified ADM address
 * @param {string} to receiver address
 * @param {number} amount amount of ADM to send
 * @returns {Promise<{success: boolean, transactionId: string}>}
 */
export function sendTokens(to, amount) {
  const transaction = newTransaction(Transactions.SEND)
  transaction.amount = utils.prepareAmount(amount)
  transaction.recipientId = to

  return client.post('/api/transactions/process', (endpoint) => {
    return { transaction: signTransaction(transaction, endpoint.timeDelta) }
  })
}

export function getDelegates(limit, offset) {
  return client.get('/api/delegates', { limit, offset })
}

export function getDelegatesWithVotes(address) {
  return client.get('/api/accounts/delegates', { address })
}

export function getDelegatesCount() {
  return client.get('/api/delegates/count')
}

export function checkUnconfirmedTransactions() {
  return client.get('/api/transactions/unconfirmed')
}

export function voteForDelegates(votes) {
  let transaction = newTransaction(Transactions.VOTE)
  transaction = Object.assign(
    {
      asset: { votes: votes },
      recipientId: myAddress,
      amount: 0
    },
    transaction
  )
  return client.post('/api/accounts/delegates', (endpoint) =>
    signTransaction(transaction, endpoint.timeDelta)
  )
}

export function getNextForgers() {
  return client.get('/api/delegates/getNextForgers', { limit: Delegates.ACTIVE_DELEGATES })
}

export function getBlocks() {
  return client.get('/api/blocks?orderBy=height:desc&limit=100')
}

export function getForgedByAccount(accountPublicKey) {
  return client.get('/api/delegates/forging/getForgedByAccount', {
    generatorPublicKey: accountPublicKey
  })
}

/**
 * Stores user address for the specified crypto
 * Before it checks if there are any address for this crypto is already stored.
 * If stored already, the function does nothing
 * @param {string} crypto crypto
 * @param {*} address user address for `crypto`
 * @returns {Promise<boolean>}
 */
export function storeCryptoAddress(crypto, address) {
  const canProceed = crypto && address && isReady() && !pendingAddresses[crypto]
  if (!canProceed) return Promise.resolve(false)

  const key = `${crypto.toLowerCase()}:address`
  pendingAddresses[crypto] = true

  // capture the current ADM address to avoid unintended behavior if the global
  // variable changes later (e.g. when logging into another account)
  const localMyAddress = myAddress

  // Don't store crypto address twice, check it first in KVS
  return getStored(key, myAddress, 20)
    .then((stored) => {
      if (myAddress !== localMyAddress) {
        return Promise.reject(
          'Reason: Logged into another account while the getStored() request was pending'
        )
      }
      // It may be empty array: no addresses stored yet for this crypto
      if (stored) {
        stored = parseCryptoAddressesKVStxs(stored, crypto)
      }
      return stored && stored.mainAddress
        ? true
        : storeValue(key, address).then((response) => response.success)
    })
    .then(
      (success) => {
        delete pendingAddresses[crypto]
        return success
      },
      (error) => {
        console.warn(`Failed to store crypto address for ${key}.`, error)
        delete pendingAddresses[crypto]
        return false
      }
    )
}

/**
 * Retrieves ADM transactions.
 * @param {{type: number, from: number, to: number}} options specifies height range
 * @returns {Promise<{success: boolean, transactions: Array}>}
 */
export function getTransactions(options = {}) {
  const query = {
    inId: myAddress,
    limit: TX_CHUNK_SIZE
  }

  if (options.minAmount) {
    query['and:minAmount'] = options.minAmount
  }
  if (options.toHeight) {
    query['and:toHeight'] = options.toHeight
  }
  if (options.fromHeight) {
    query['and:fromHeight'] = options.fromHeight
  }
  if (options.type) {
    query['and:type'] = options.type
  }
  if (options.orderBy) {
    query.orderBy = options.orderBy
  }

  return client.get('/api/transactions', query)
}

/**
 * Returns transaction with the specified ID.
 * @param {string} id transaction ID
 * @param {number} returnAsset 1 - Populate `asset` property; 0 - Leave `asset` empty
 * @returns {Promise<{id: string, height: number, amount: number}>}
 */
export function getTransaction(id, returnAsset = 0) {
  const query = { id, returnAsset }
  return client
    .get('/api/transactions/get', query)
    .then((response) => {
      if (response.success) return response
      return client.get('/api/transactions/unconfirmed/get', query)
    })
    .then((response) => response.transaction || null)
}

/**
 * Retrieves chat messages for the current account.
 * @param {number} from Fetch messages starting from the specified height
 * @param {number} offset Offset (defaults to 0)
 * @param {string} orderBy Can be: `asc` || `desc`
 * @returns {Promise<{count: number, transactions: Array}>}
 */
export function getChats(from = 0, offset = 0, orderBy = 'desc') {
  const params = {
    // returnAsset: 1,
    // types: '0,8',
    // inId: myAddress,
    isIn: myAddress,
    orderBy: `timestamp:${orderBy}`
  }

  if (from) {
    params.fromHeight = from
  }

  if (offset) {
    params.offset = offset
  }

  // Doesn't return ADM direct transfer transactions, only messages and in-chat transfers
  // https://github.com/Adamant-im/adamant/wiki/API-Specification#get-chat-transactions
  return client.get('/api/chats/get/', params).then((response) => {
    const { count, transactions } = response

    const promises = transactions.map((transaction) => {
      const promise = isStringEqualCI(transaction.recipientId, myAddress)
        ? Promise.resolve(transaction.senderPublicKey)
        : queue.add(() => getPublicKey(transaction.recipientId))

      return promise
        .then((key) => {
          if (key) return decodeChat(transaction, key)

          console.warn(
            `Cannot decode tx ${transaction.id}: no public key for account ${transaction.recipientId}`
          )
          return null
        })
        .catch((err) => console.warn('Failed to parse chat message', { transaction, err }))
    })

    return Promise.all(promises).then((decoded) => ({
      count,
      transactions: decoded.filter((v) => v)
    }))
  })
}

/**
 * Decodes chat transaction message setting the `message` property of the `transaction`. If the message is a
 * pre-defined I18N-one, `isI18n` property is also set to `true`.
 * @param {{senderId: string, asset: object}} transaction chat transaction
 * @param {Buffer} key sender public key
 * @returns {{senderId: string, asset: object, message: any, isI18n: boolean}}
 */
export function decodeChat(transaction, key) {
  const chat = transaction.asset.chat

  // The user may not have a public key, so the message cannot be decoded.
  // Display a special message instead.
  if (!key) {
    transaction.message = 'chats.unable_to_retrieve_no_public_key'
    transaction.i18n = true
    console.warn("Error while retrieving a message (no partner's public key) for Tx", transaction)

    return transaction
  }

  const message = utils.decodeMessage(chat.message, key, myKeypair.privateKey, chat.own_message)

  if (!message) return transaction

  if (chat.type === MessageType.RICH_CONTENT_MESSAGE) {
    // So-called rich-text messages of type 2 are actually JSON objects
    transaction.message = JSON.parse(message)
  } else {
    // Text message may actually be an internationalizable auto-generated message (we used to have those
    // at the beginning)
    const i18nMsg = getI18nMessage(message, transaction.senderId)
    if (i18nMsg) {
      // Yeap, that's a i18n one
      transaction.message = i18nMsg
      transaction.i18n = true
    } else {
      transaction.message = message
    }
  }

  return transaction
}

/**
 * Decode transaction.
 * This function must be used in favor of `decodeChat` since it also handles ADM transfers.
 * @param transaction Transaction
 * @param address ADM address of the current user account
 */
export function decodeTransaction(transaction, address) {
  const publicKey =
    transaction.senderId === address ? transaction.recipientPublicKey : transaction.senderPublicKey

  if (transaction.type === 0) {
    // ADM transfer transaction doesn't have `asset` property, nothing to decode
    return transaction
  }

  return decodeChat(transaction, publicKey)
}

/**
 * Checks if the specified `message` is an auto-generated i18n message. If it is, its respective i18n code is returned.
 * Otherwise returns an empty string.
 * @param {string} message message to check
 * @param {string} senderId message sender address
 * @returns {string}
 */
function getI18nMessage(message, senderId) {
  // At the beginning of the project we used to send auto-generated welcome messages to the new users.
  // These messages have i18n codes as their content and known senders listed below.
  // P.S. I hate this function, but there's no way to get rid of it now.

  const isI18n =
    (message.indexOf('chats.welcome_message') > -1 && senderId === 'U15423595369615486571') ||
    (message.indexOf('chats.ico_message') > -1 && senderId === 'U7047165086065693428')

  if (isI18n) {
    if (senderId === 'U15423595369615486571' || senderId === 'U7047165086065693428') {
      return 'chats.virtual.welcome_message'
    }
  }

  return ''
}

/**
 * Performs application login
 * @param {string} Passphrase
 * @return Promise<string> User address
 */
export function loginOrRegister(passphrase) {
  try {
    unlock(passphrase)
  } catch (e) {
    return Promise.reject(e)
  }

  return getCurrentAccount()
}

/**
 * Login via password.
 * @param {string} password
 * @param {any} store
 * @returns {Promise} Encrypted password
 */
export function loginViaPassword(password, store) {
  return encryptPassword(password)
    .then((encryptedPassword) => {
      store.commit('setPassword', encryptedPassword)

      return restoreState(store)
    })
    .then(() => {
      const passphrase = Base64.decode(store.state.passphrase)

      try {
        unlock(passphrase)
      } catch (e) {
        return Promise.reject(e)
      }

      return getCurrentAccount().then((account) => ({
        ...account,
        passphrase
      }))
    })
}

/**
 * AIP16: Get chat rooms.
 *
 * @param {string} address Adamant address
 * @param {any} params
 * @returns {Promise}
 */
export async function getChatRooms(address, params) {
  const defaultParams = {
    orderBy: 'timestamp:desc',
    limit: 25,
    offset: 0
  }

  const { count, chats } = await client.get(`/api/chatrooms/${address}`, {
    ...defaultParams,
    ...params
  })

  const messages = chats.flatMap((chat) => {
    const partner =
      chat.lastTransaction.senderId === address
        ? {
            publicKey: chat.lastTransaction.recipientPublicKey,
            address: chat.lastTransaction.recipientId
          }
        : {
            publicKey: chat.lastTransaction.senderPublicKey,
            address: chat.lastTransaction.senderId
          }

    if (partner.address && partner.publicKey) {
      store.commit('setPublicKey', {
        adamantAddress: partner.address,
        publicKey: partner.publicKey
      })
    }

    try {
      if (chat.lastTransaction.type === 0) {
        return [chat.lastTransaction]
      }

      return [decodeChat(chat.lastTransaction, partner.publicKey)]
    } catch (err) {
      console.warn('Failed to parse chat message', { chat, err })
      return []
    }
  })

  const lastMessageHeight = (messages[0] && messages[0].height) || 0

  return {
    messages,
    count,
    lastMessageHeight
  }
}

/**
 * AIP16: Get chat room messages.
 *
 * @param {string} address1 Adamant address
 * @param {string} address2 Adamant address
 * @param {any} params
 * @returns {Promise}
 */
export async function getChatRoomMessages(address1, address2, paramsArg, recursive = false) {
  const defaultParams = {
    orderBy: 'timestamp:desc',
    limit: 25
  }

  const params = {
    ...defaultParams,
    ...paramsArg
  }

  let allDecodedMessages = []
  let lastOffset = params.offset
  const limit = params.limit

  const loadMessages = async (offset) => {
    const { participants, messages } = await client.get(`/api/chatrooms/${address1}/${address2}`, {
      ...defaultParams,
      offset,
      limit
    })
    lastOffset += messages.length

    if (messages.length === 0) {
      return {
        participants,
        messages: allDecodedMessages,
        lastOffset
      }
    }

    const decodedMessages = messages.flatMap((message) => {
      const publicKey =
        message.senderId === address1 ? message.recipientPublicKey : message.senderPublicKey

      try {
        if (message.type === 0) {
          return [message]
        }

        return [decodeChat(message, publicKey)]
      } catch (err) {
        console.warn('Failed to parse chat message', { message, err })
        return []
      }
    })
    allDecodedMessages = [...allDecodedMessages, ...decodedMessages]

    if (recursive) {
      const countMessages = allDecodedMessages.reduce((acc, curr) => {
        if (typeof curr.message === 'object' && curr.message.reactto_id) {
          return acc
        }

        return acc + 1
      }, 0) // reactions are excluded

      if (countMessages <= limit) {
        return loadMessages(lastOffset)
      }
    }

    return {
      participants,
      messages: allDecodedMessages,
      lastOffset
    }
  }

  return loadMessages(lastOffset)
}
