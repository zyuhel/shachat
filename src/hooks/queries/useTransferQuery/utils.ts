import { Cryptos, CryptoSymbol } from '@/lib/constants'
import { PendingTxStore } from '@/lib/pending-transactions'
import { getTxFetchInfo } from '@/lib/transactionsFetching'

export function retryFactory(crypto: CryptoSymbol, transactionId: string) {
  const txFetchInfo = getTxFetchInfo(crypto)

  return (failureCount: number): boolean => {
    const pendingTransaction = PendingTxStore.get(Cryptos.BTC)
    const isPendingTransaction = pendingTransaction?.id === transactionId

    const attempts = isPendingTransaction
      ? txFetchInfo.newPendingAttempts
      : txFetchInfo.oldPendingAttempts

    return failureCount + 1 < attempts
  }
}

export function retryDelayFactory(crypto: CryptoSymbol, transactionId: string) {
  const txFetchInfo = getTxFetchInfo(crypto)

  return (): number => {
    const pendingTransaction = PendingTxStore.get(Cryptos.BTC)
    const isPendingTransaction = pendingTransaction?.id === transactionId

    const delay = isPendingTransaction
      ? txFetchInfo.newPendingInterval
      : txFetchInfo.oldPendingInterval

    return delay
  }
}

export function refetchIntervalFactory(crypto: CryptoSymbol): number {
  const txFetchInfo = getTxFetchInfo(crypto)

  return txFetchInfo.registeredInterval
}
