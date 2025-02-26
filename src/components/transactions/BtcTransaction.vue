<template>
  <TransactionTemplate
    :transaction="transaction"
    :fee="fee"
    :confirmations="confirmations"
    :sender-formatted="senderFormatted || ''"
    :recipient-formatted="recipientFormatted || ''"
    :explorer-link="explorerLink"
    :partner="partnerAdmAddress || ''"
    :query-status="queryStatus"
    :transaction-status="status"
    :inconsistent-status="inconsistentStatus"
    :adm-tx="admTx"
    :crypto="crypto"
    @refetch-status="refetch"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import TransactionTemplate from './TransactionTemplate.vue'
import { getExplorerTxUrl } from '@/config/utils'
import { CryptoSymbol } from '@/lib/constants'
import { useBlockHeight } from '@/hooks/queries/useBlockHeight'
import { useBtcAddressPretty } from './hooks/address'
import { useTransactionStatus } from './hooks/useTransactionStatus'
import { useInconsistentStatus } from './hooks/useInconsistentStatus'
import { useFindAdmTransaction } from './hooks/useFindAdmTransaction'
import {
  useBtcTransactionQuery,
  useDogeTransactionQuery,
  useDashTransactionQuery
} from '@/hooks/queries/transaction'
import { useClearPendingTransaction } from './hooks/useClearPendingTransaction'
import { getPartnerAddress } from './utils/getPartnerAddress'

const query = {
  BTC: useBtcTransactionQuery,
  DASH: useDashTransactionQuery,
  DOGE: useDogeTransactionQuery
} as const

export default defineComponent({
  components: {
    TransactionTemplate
  },
  props: {
    crypto: {
      required: true,
      type: String as PropType<Extract<CryptoSymbol, 'BTC' | 'DOGE' | 'DASH'>>
    },
    id: {
      required: true,
      type: String
    }
  },
  setup(props) {
    const store = useStore()

    const cryptoKey = computed(() => props.crypto.toLowerCase())
    const cryptoAddress = computed(() => store.state[cryptoKey.value].address)

    const useTransactionQuery = query[props.crypto]
    const {
      status: queryStatus,
      isFetching,
      data: transaction,
      refetch
    } = useTransactionQuery(props.id)
    const inconsistentStatus = useInconsistentStatus(transaction, props.crypto)
    const transactionStatus = computed(() => transaction.value?.status)
    const status = useTransactionStatus(
      isFetching,
      queryStatus,
      transactionStatus,
      inconsistentStatus
    )
    useClearPendingTransaction(props.crypto, transaction)

    const admTx = useFindAdmTransaction(props.id)
    const senderAdmAddress = computed(() => admTx.value?.senderId || '')
    const recipientAdmAddress = computed(() => admTx.value?.recipientId || '')
    const partnerAdmAddress = computed(() =>
      admTx.value
        ? getPartnerAddress(admTx.value?.senderId, admTx.value?.recipientId, cryptoAddress.value)
        : ''
    )

    const senderFormatted = useBtcAddressPretty(
      transaction,
      cryptoAddress,
      senderAdmAddress,
      'sender'
    )
    const recipientFormatted = useBtcAddressPretty(
      transaction,
      cryptoAddress,
      recipientAdmAddress,
      'recipient'
    )

    const explorerLink = computed(() => getExplorerTxUrl(props.crypto, props.id))

    const blockHeight = useBlockHeight(props.crypto, {
      enabled: () => transactionStatus.value === 'CONFIRMED'
    })
    const confirmations = computed(() => {
      if (!transaction.value || !blockHeight.value) return NaN

      if ('height' in transaction.value) {
        // BTC and DASH have `height`
        const height = transaction.value.height as number // workaround: TS doesn't infer the type correctly
        return blockHeight.value - height + 1
      } else {
        // DOGE doesn't have `height`
        return transaction.value.confirmations
      }
    })

    const fee = computed(() => transaction.value?.fee)

    return {
      refetch,
      transaction,
      fee,
      senderFormatted,
      recipientFormatted,
      partnerAdmAddress,
      explorerLink,
      confirmations,
      admTx,
      queryStatus,
      status,
      inconsistentStatus
    }
  }
})
</script>
