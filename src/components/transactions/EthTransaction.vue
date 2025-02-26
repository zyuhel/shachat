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
    @refetch-status="refetch"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import TransactionTemplate from './TransactionTemplate.vue'
import { getExplorerTxUrl } from '@/config/utils'
import { Cryptos, CryptoSymbol } from '@/lib/constants'
import { useCryptoAddressPretty } from './hooks/address'
import { useTransactionStatus } from './hooks/useTransactionStatus'
import { useInconsistentStatus } from './hooks/useInconsistentStatus'
import { useFindAdmTransaction } from './hooks/useFindAdmTransaction'
import { useBlockHeight } from '@/hooks/queries/useBlockHeight'
import { useEthTransactionQuery } from '@/hooks/queries/transaction'
import { useClearPendingTransaction } from './hooks/useClearPendingTransaction'
import { getPartnerAddress } from './utils/getPartnerAddress'

export default defineComponent({
  components: {
    TransactionTemplate
  },
  props: {
    id: {
      required: true,
      type: String
    },
    crypto: {
      required: true,
      type: String as PropType<CryptoSymbol>
    }
  },
  setup(props) {
    const store = useStore()

    const cryptoAddress = computed(() => store.state.eth.address)

    const {
      status: queryStatus,
      isFetching,
      data: transaction,
      refetch
    } = useEthTransactionQuery(props.id)
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

    const explorerLink = computed(() => getExplorerTxUrl(Cryptos.ETH, props.id))
    const blockHeight = useBlockHeight('ETH', {
      enabled: () => transactionStatus.value === 'CONFIRMED'
    })
    const confirmations = computed(() => {
      if (!blockHeight.value || !transaction.value) return NaN

      if ('blockNumber' in transaction.value && transaction.value.blockNumber) {
        return blockHeight.value - transaction.value.blockNumber + 1
      }

      return transaction.value?.confirmations
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
