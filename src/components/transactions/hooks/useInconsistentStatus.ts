import { computed, Ref } from 'vue'
import { useStore } from 'vuex'
import { useFindAdmTransaction } from './useFindAdmTransaction'
import { useKVSCryptoAddress } from '@/hooks/queries/useKVSCryptoAddress'
import { CryptoSymbol, isErc20 } from '@/lib/constants'
import { DecodedChatMessageTransaction } from '@/lib/adamant-api'
import { getInconsistentStatus, InconsistentStatus } from '../utils/getInconsistentStatus'
import {
  BtcTransaction,
  DashTransaction,
  DogeTransaction,
  Erc20Transaction,
  EthTransaction,
  KlyTransaction
} from '@/lib/nodes/types/transaction'
import { PendingTransaction } from '@/lib/pending-transactions'

export function useInconsistentStatus(
  transaction: Ref<
    | BtcTransaction
    | DogeTransaction
    | DashTransaction
    | KlyTransaction
    | EthTransaction
    | Erc20Transaction
    | PendingTransaction
    | DecodedChatMessageTransaction
    | undefined
  >,
  crypto: CryptoSymbol
) {
  const store = useStore()

  const mineCryptoAddress = computed(() => {
    if (isErc20(crypto)) return store.state.eth.address

    return store.state[crypto.toLowerCase()].address
  })
  const transactionId = computed(() => transaction.value?.id)

  const admTx = useFindAdmTransaction(transactionId)
  const senderId = computed(() => admTx.value?.senderId)
  const recipientId = computed(() => admTx.value?.recipientId)
  const senderCryptoAddress = useKVSCryptoAddress(senderId, crypto)
  const recipientCryptoAddress = useKVSCryptoAddress(recipientId, crypto)

  return computed<InconsistentStatus>(() => {
    if (
      !transaction.value ||
      !admTx.value ||
      !mineCryptoAddress.value ||
      !senderCryptoAddress.value ||
      !recipientCryptoAddress.value
    )
      return ''

    return getInconsistentStatus(transaction.value, admTx.value, {
      senderCryptoAddress: senderCryptoAddress.value,
      recipientCryptoAddress: recipientCryptoAddress.value
    })
  })
}
