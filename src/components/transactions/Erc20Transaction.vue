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
    :feeCrypto="AllCryptos.ETH"
    @refetch-status="refetch"
  />
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { useStore } from 'vuex'
import TransactionTemplate from './TransactionTemplate.vue'
import { getExplorerTxUrl } from '@/config/utils'
import { Cryptos, CryptoSymbol } from '@/lib/constants'
import { AllCryptos } from '@/lib/constants/cryptos'
import { useCryptoAddressPretty } from './hooks/address'
import { useBlockHeight } from '@/hooks/queries/useBlockHeight'
import { useTransactionStatus } from './hooks/useTransactionStatus'
import { useInconsistentStatus } from './hooks/useInconsistentStatus'
import { useFindAdmTransaction } from './hooks/useFindAdmTransaction'
import { useErc20TransactionQuery } from '@/hooks/queries/transaction'
import { useClearPendingTransaction } from './hooks/useClearPendingTransaction'
import { getPartnerAddress } from './utils/getPartnerAddress'

const props = defineProps({
  crypto: {
    required: true,
    type: String as PropType<CryptoSymbol>
  },
  id: {
    required: true,
    type: String
  }
})

const store = useStore()

const cryptoAddress = computed(() => store.state.eth.address)

const {
  status: queryStatus,
  isFetching,
  data: transaction,
  refetch
} = useErc20TransactionQuery(props.crypto)(props.id)
const inconsistentStatus = useInconsistentStatus(transaction, props.crypto)
const transactionStatus = computed(() => transaction.value?.status)
const status = useTransactionStatus(isFetching, queryStatus, transactionStatus, inconsistentStatus)
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
</script>
