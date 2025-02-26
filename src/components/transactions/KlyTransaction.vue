<template>
  <TransactionTemplate
    :transaction="transaction"
    :fee="fee"
    :confirmations="confirmations || NaN"
    :sender-formatted="senderFormatted || ''"
    :recipient-formatted="recipientFormatted || ''"
    :explorer-link="explorerLink"
    :partner="partnerAdmAddress || ''"
    :query-status="queryStatus"
    :transaction-status="status"
    :inconsistent-status="inconsistentStatus"
    :adm-tx="admTx"
    :crypto="crypto"
    :text-data="textData"
    @refetch-status="refetch"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { useStore } from 'vuex'
import TransactionTemplate from './TransactionTemplate.vue'
import { getExplorerTxUrl } from '@/config/utils'
import { Cryptos, CryptoSymbol } from '@/lib/constants'
import { useCryptoAddressPretty } from './hooks/address'
import { useBlockHeight } from '@/hooks/queries/useBlockHeight'
import { useTransactionStatus } from './hooks/useTransactionStatus'
import { useInconsistentStatus } from './hooks/useInconsistentStatus'
import { useFindAdmTransaction } from './hooks/useFindAdmTransaction'
import { useKlyTransactionQuery } from '@/hooks/queries/transaction'
import { useClearPendingTransaction } from './hooks/useClearPendingTransaction'
import { getPartnerAddress } from './utils/getPartnerAddress'

export default defineComponent({
  name: 'KlyTransaction',
  components: {
    TransactionTemplate
  },
  props: {
    crypto: {
      required: true,
      type: String as PropType<CryptoSymbol>
    },
    id: {
      required: true,
      type: String
    }
  },
  setup(props) {
    const store = useStore()

    const cryptoAddress = computed(() => store.state.kly.address)

    const {
      status: queryStatus,
      isFetching,
      data: transaction,
      refetch
    } = useKlyTransactionQuery(props.id)
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

    const senderFormatted = useCryptoAddressPretty(
      transaction,
      cryptoAddress,
      senderAdmAddress,
      'sender'
    )
    const recipientFormatted = useCryptoAddressPretty(
      transaction,
      cryptoAddress,
      recipientAdmAddress,
      'recipient'
    )

    const explorerLink = computed(() => getExplorerTxUrl(Cryptos.KLY, props.id))

    const blockHeight = useBlockHeight('KLY', {
      enabled: () => transactionStatus.value === 'CONFIRMED'
    })

    const confirmations = computed(() => {
      if (transaction.value && 'height' in transaction.value) {
        const { height } = transaction.value
        const currentHeight = unref(blockHeight)

        if (height === undefined || currentHeight === 0) {
          return 0
        }

        return currentHeight - height + 1
      }

      return 0
    })

    const fee = computed(() => transaction.value?.fee)
    const textData = computed(() =>
      transaction.value && 'data' in transaction.value ? transaction.value.data : ''
    )

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
      inconsistentStatus,
      textData
    }
  }
})
</script>
