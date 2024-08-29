/**
 * AIP 12: Non-ADM crypto transfer messages
 * @see https://aips.adamant.im/AIPS/aip-12
 */
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
 * Reply to a message
 *
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
 *
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

interface CryptoTransferPayload {
  cryptoSymbol: string
  amount: string
  hash: string
  comments: string
}

export function cryptoTransferAsset(payload: CryptoTransferPayload): CryptoTransferAsset

interface ReplyMessagePayload {
  replyToId: string
  replyMessage: string
}

export function replyMessageAsset(payload: ReplyMessagePayload): ReplyMessageAsset

export function replyWithCryptoTransferAsset(
  replyToId: string,
  transferPayload: CryptoTransferPayload
): ReplyWithCryptoTransferAsset

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

export function reactionAsset(reactToId: string, reactMessage: string): ReactionAsset

export function signalAsset(
  token: string,
  provider: 'apns' | 'fcm',
  action: 'add' | 'remove'
): SignalMessagePayload
