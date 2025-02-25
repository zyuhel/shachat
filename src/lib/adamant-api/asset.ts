import { MessageType } from '@/lib/constants'
import { extractFileExtension, extractFileName, FileData } from '@/lib/files'

interface CryptoTransferPayload {
  cryptoSymbol: string
  amount: string
  hash: string
  comments: string
  text_fallback?: string
}

export interface CryptoTransferAsset {
  /**
   * Represents token's network and looks like `tickerSymbol_transaction`,
   * e.g. `eth_transaction`. Ticker symbol must be in lower case, but apps
   * must process it in any case for backwards compatibility.
   */
  type: string
  /**
   * Transferred value in tokens of its network. Decimal separator is `.`
   */
  amount: string
  /**
   * Transaction id in token's network. Used to check transaction status
   */
  hash: string
  /**
   * May include comment for this transfer, shown to both recipient and sender
   */
  comments?: string
  /**
   * Can be added to show explanation text messages on client apps that doesn't
   * support specified `type`
   */
  text_fallback?: string
}

/**
 * AIP 12: Non-ADM crypto transfer messages
 * @see https://aips.adamant.im/AIPS/aip-12
 */
export function cryptoTransferAsset({
  cryptoSymbol,
  amount,
  hash,
  comments,
  text_fallback
}: CryptoTransferPayload): CryptoTransferAsset {
  const asset: CryptoTransferAsset = {
    type: MessageType.cryptoTransferMessage(cryptoSymbol),
    amount,
    hash,
    comments
  }

  if (text_fallback) {
    asset.text_fallback = text_fallback
  }

  return asset
}

interface ReplyMessagePayload {
  replyToId: string
  replyMessage: string
}

/**
 * Reply to a message
 * @see https://aips.adamant.im/AIPS/aip-16
 */
export interface ReplyMessageAsset {
  /**
   * ADM transaction ID of a message which a user replies to
   */
  replyto_id: string
  /**
   * Text of a reply
   */
  reply_message: string
}

/**
 * Reply to a message with a crypto transfer
 * @see https://aips.adamant.im/AIPS/aip-16
 */
export interface ReplyWithCryptoTransferAsset {
  /**
   * ADM transaction ID of a message which a user replies to
   */
  replyto_id: string
  /**
   * Text of a reply
   */
  reply_message: CryptoTransferAsset
}

export function replyMessageAsset({
  replyToId,
  replyMessage
}: ReplyMessagePayload): ReplyMessageAsset {
  return {
    replyto_id: replyToId,
    reply_message: replyMessage
  }
}

export function replyWithCryptoTransferAsset(
  replyToId: string,
  transferPayload: CryptoTransferPayload
): ReplyWithCryptoTransferAsset {
  return {
    replyto_id: replyToId,
    reply_message: cryptoTransferAsset(transferPayload)
  }
}

export interface ReactionAsset {
  /**
   * ADM transaction ID of the message to which the user is reacting
   */
  reactto_id: string
  /**
   * Represents the emoji-based reaction
   */
  react_message: string
}

export function reactionAsset(reactToId: string, reactMessage: string): ReactionAsset {
  return {
    reactto_id: reactToId,
    react_message: reactMessage
  }
}

export interface FileAsset {
  /**
   * Specifies the MIME type of the file, e.g. "image/jpeg"
   */
  mimeType?: string
  /**
   * Specifies the name of a file (without extension).
   */
  name?: string
  /**
   * Indicates the file extension, e.g. "jpeg", "png", "pdf", etc.
   */
  extension?: string
  /**
   * File resolution as an array of float values.
   * The first value is width, the second is height.
   */
  resolution?: [number, number]
  /**
   * Duration of the video or audio file in seconds.
   */
  duration?: number
  /**
   * Represents the unique file identifier in the `storage` network.
   * For example, for IPFS it's CID.
   */
  id: string
  /**
   * Indicates the size of the encrypted file in bytes
   */
  size: number
  /**
   * Nonce used for encryption
   */
  nonce: string
  /**
   * Preview of the image.
   */
  preview?: {
    /**
     * Represents the unique file identifier in the `storage` network.
     * For example, for IPFS it's CID.
     */
    id: string
    /**
     * Nonce used for encryption
     */
    nonce: string
    /**
     * Indicates the file extension, e.g. "jpeg", "png", "pdf", etc.
     */
    extension: string
  }
}

export interface AttachmentAsset {
  files: FileAsset[]
  storage: { id: 'ipfs' }
  /**
   * Optional comment associated with the transaction
   */
  comment?: string
}

/**
 * AIP-18: https://github.com/Adamant-im/AIPs/pull/54/files
 * @param {Array<FileData>} files
 * @param {Array<[string, string]>} [nonces] First element is the nonce of original file, second is nonce of preview
 * @param {Array<[string, string]>} [ids] List of files IDs after uploading to IPFS. First element is the ID of original file, second is ID of preview.
 * @param {string} [comment]
 */
export function attachmentAsset(files: FileData[], comment?: string): AttachmentAsset {
  return {
    files: files.map(({ file, width, height, cid, preview, encoded }) => {
      const name = extractFileName(file.name)
      const extension = extractFileExtension(file.name)!
      const resolution: FileAsset['resolution'] = width && height ? [width, height] : undefined

      return {
        mimeType: file.type,
        name,
        extension,
        resolution,
        duration: undefined, // @todo check if is a video or audio file
        size: file.size,
        id: cid,
        nonce: encoded.nonce,
        preview: preview
          ? {
              id: preview.cid,
              nonce: preview.encoded.nonce,
              extension
            }
          : undefined
      }
    }),
    comment,
    storage: { id: 'ipfs' }
  }
}
