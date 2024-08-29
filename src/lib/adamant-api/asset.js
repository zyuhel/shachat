import { MessageType } from '@/lib/constants'

export function cryptoTransferAsset({ cryptoSymbol, amount, hash, comments, text_fallback }) {
  const asset = {
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

export function replyMessageAsset({ replyToId, replyMessage }) {
  return {
    replyto_id: replyToId,
    reply_message: replyMessage
  }
}

export function replyWithCryptoTransferAsset(replyToId, transferPayload) {
  return {
    replyto_id: replyToId,
    reply_message: cryptoTransferAsset(transferPayload)
  }
}

export function reactionAsset(reactToId, reactMessage) {
  return {
    reactto_id: reactToId,
    react_message: reactMessage
  }
}

export function signalAsset(token, provider, action) {
  return {
    token,
    provider,
    action
  }
}
