import { PendingTransactionError } from './errors'
import { PendingTxStore } from './storage'

type TxFinalizeChecker = (hash: string) => Promise<boolean>

/**
 * Asserts that there is no pending transaction for the given crypto
 *
 * @param crypto e.g. 'ETH' | 'KLY'
 * @param nonce Current nonce
 */
export function assertNoPendingTransaction(crypto: string, nonce: string | number | bigint) {
  const pendingTransaction = PendingTxStore.get(crypto)
  if (!pendingTransaction) {
    return
  }

  const nonceProvided = pendingTransaction.nonce != undefined && nonce != undefined
  if (nonceProvided && Number(nonce) <= Number(pendingTransaction.nonce)) {
    throw new PendingTransactionError(pendingTransaction, crypto)
  }
  if (!nonceProvided && !pendingTransaction.confirmations) {
    throw new PendingTransactionError(pendingTransaction, crypto)
  }
}

/**
 * Invalidates previous pending transaction.
 * If transaction is finalized then it will be removed from the store.
 *
 * @param crypto  e.g. 'ETH' | 'KLY'
 * @param checkTransactionFinalized Must return `true` if transaction was written to blockchain.
 */
export async function invalidatePendingTransaction(
  crypto: string,
  checkTransactionFinalized: TxFinalizeChecker
) {
  const pendingTransaction = PendingTxStore.get(crypto)
  if (!pendingTransaction) {
    return
  }

  const isFinalized = await checkTransactionFinalized(pendingTransaction.hash)
  if (isFinalized) {
    PendingTxStore.remove(crypto)
  }
}
