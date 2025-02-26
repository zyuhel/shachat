import { FileData } from '@/lib/files'
import utils from '@/lib/adamant'
import { EncodedFile } from '@/lib/adamant-api'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers/normalizeMessage'
import { TransactionStatus as TS, TransactionStatusType } from '@/lib/constants'
import { attachmentAsset } from '@/lib/adamant-api/asset'

type Params = {
  recipientId: string
  senderId: string
  files: FileData[]
  nonces?: [string, string]
  ids?: [string, string]
  encodedFiles?: EncodedFile[]
  message?: string
  replyToId?: string
  status?: TransactionStatusType
}
/**
 * Creates a message object with uniq ID.
 */
export function createAttachment({
  recipientId,
  senderId,
  files,
  message,
  replyToId,
  status = TS.PENDING
}: Params) {
  const timestamp = Date.now()
  const id = utils.epochTime().toString()

  const transaction: NormalizedChatMessageTransaction = {
    id,
    hash: id,
    recipientId,
    senderId,
    message: message || '',
    status,
    timestamp: Date.now(),
    type: 'attachment',
    asset: replyToId
      ? { replyto_id: replyToId, reply_message: attachmentAsset(files, message) }
      : attachmentAsset(files, message),
    /**
     * When sending a message, we need to store the files locally.
     */
    localFiles: files.map((file) => {
      return {
        file,
        loading: true,
        error: null
      }
    }),
    isReply: !!replyToId,
    confirmations: 0,
    height: 0,
    admTimestamp: Math.floor(timestamp / 1000),
    i18n: false,
    amount: 0
  }

  return transaction
}
