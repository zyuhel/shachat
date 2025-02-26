import type { QueryStatus } from '@tanstack/vue-query'
import { computed, Ref } from 'vue'
import { TransactionStatus, TransactionStatusType } from '@/lib/constants'
import { InconsistentStatus } from '../utils/getInconsistentStatus'

export function useTransactionStatus(
  isFetching: Ref<boolean>,
  queryStatus: Ref<QueryStatus>,
  transactionStatus?: Ref<TransactionStatusType | undefined>,
  inconsistentStatus?: Ref<InconsistentStatus>
) {
  return computed(() => {
    if (queryStatus.value === 'error') return TransactionStatus.REJECTED
    if (queryStatus.value === 'success') {
      if (inconsistentStatus?.value) return TransactionStatus.INVALID

      return transactionStatus?.value || TransactionStatus.CONFIRMED
    }
    if (isFetching.value) return TransactionStatus.PENDING

    return TransactionStatus.UNKNOWN
  })
}
