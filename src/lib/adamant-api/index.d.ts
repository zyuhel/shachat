import { Store } from 'vuex'

import { Transactions } from '@/lib/constants'
import { CryptoSymbol } from '@/lib/constants/cryptos'
import {
  AccountDto,
  AnyTransaction,
  BaseTransaction,
  ChatMessageTransaction,
  ChatsApiGetChatroomMessagesRequest,
  ChatsApiGetChatRoomsRequest,
  CreateNewChatMessageResponseDto,
  GetAccountVotesResponseDto,
  GetBlocksResponseDto,
  GetDelegatesCountResponseDto,
  GetDelegatesResponseDto,
  GetDelegateStatsResponseDto,
  GetNextForgersResponseDto,
  GetTransactionsResponseDto,
  GetUnconfirmedTransactionsResponseDto,
  QueuedTransaction,
  RegisterAnyTransaction,
  RegisterChatMessageTransaction,
  RegisterKVSTransaction,
  RegisterNewDelegateTransaction,
  RegisterTokenTransferTransaction,
  RegisterVoteForDelegateTransaction,
  SetKVSResponseDto,
  TransactionsApiGetTransactionsRequest,
  TransferTokenResponseDto
} from '@/lib/schema/client/api'
import { RootState } from '@/store/types'

export declare const TX_CHUNK_SIZE: number

export type UnsignedNewTransaction = Pick<
  BaseTransaction,
  'type' | 'amount' | 'senderId' | 'senderPublicKey'
>

export type RegisterChatMessageTransactionUnsigned = Omit<
  RegisterChatMessageTransaction,
  'signature' | 'timestamp'
>
export type RegisterTokenTransferTransactionUnsigned = Omit<
  RegisterTokenTransferTransaction,
  'signature' | 'timestamp'
>
export type RegisterKVSTransactionUnsigned = Omit<RegisterKVSTransaction, 'signature' | 'timestamp'>
export type RegisterVoteForDelegateTransactionUnsigned = Omit<
  RegisterVoteForDelegateTransaction,
  'signature' | 'timestamp'
>
export type RegisterNewDelegateTransactionUnsigned = Omit<
  RegisterNewDelegateTransaction,
  'signature' | 'timestamp'
>

export type RegisterAnyTransactionUnsigned =
  | RegisterChatMessageTransactionUnsigned
  | RegisterTokenTransferTransactionUnsigned
  | RegisterKVSTransactionUnsigned
  | RegisterVoteForDelegateTransactionUnsigned
  | RegisterNewDelegateTransactionUnsigned

export function newTransaction(type: number): UnsignedNewTransaction

export function signTransaction(
  transaction: RegisterAnyTransactionUnsigned,
  timeDelta: number
): RegisterAnyTransaction

export function unlock(passphrase: string): string

export type CurrentAccount = Omit<AccountDto, 'balance' | 'unconfirmedBalance'> & {
  balance: number // string balance was normalized into ADM units
  unconfirmedBalance: number // string balance was normalized into ADM units
}
export function getCurrentAccount(): Promise<CurrentAccount>

export function isReady(): boolean

export function getPublicKey(address: string): Promise<string>

export type SendMessageParams = {
  to: string // address
  message?: string | object
  type?: typeof Transactions.SEND | typeof Transactions.CHAT_MESSAGE
  amount?: number
}
export function sendMessage(params: SendMessageParams): Promise<CreateNewChatMessageResponseDto>

export type EncodedFile = {
  binary: Uint8Array
  nonce: string
}

export function encodeFile(file: Uint8Array, params: SendMessageParams): Promise<EncodedFile>

export function sendSpecialMessage(
  to: string,
  message: SendMessageParams['message']
): ReturnType<typeof sendMessage>

export function storeValue(
  key: string,
  value: string | object,
  encode?: boolean
): Promise<SetKVSResponseDto>

export function getStored(key: string, ownerAddress: string, records?: number): Promise<unknown>

export function sendTokens(to: string, amount: number): Promise<TransferTokenResponseDto>
export function getDelegates(limit: number, offset: number): Promise<GetDelegatesResponseDto>
export function getDelegatesWithVotes(address: string): Promise<GetAccountVotesResponseDto>
export function getDelegatesCount(): Promise<GetDelegatesCountResponseDto>
export function checkUnconfirmedTransactions(): Promise<GetUnconfirmedTransactionsResponseDto>

export function voteForDelegates(votes: string[]): Promise<RegisterVoteForDelegateTransaction>
export function getNextForgers(): Promise<GetNextForgersResponseDto>
export function getBlocks(): Promise<GetBlocksResponseDto>
export function getForgedByAccount(): Promise<GetDelegateStatsResponseDto>

export function storeCryptoAddress(crypto: CryptoSymbol, address: string): Promise<boolean>

type GetTransactionsOptions = Pick<
  TransactionsApiGetTransactionsRequest,
  'minAmount' | 'toHeight' | 'fromHeight' | 'type' | 'orderBy'
>
export function getTransactions(
  options: GetTransactionsOptions
): Promise<GetTransactionsResponseDto>

export function getTransaction(
  id: string,
  returnAsset?: 0 | 1
): Promise<AnyTransaction | QueuedTransaction | null>

export function getChats(
  from?: number,
  offset?: number,
  orderBy?: 'asc' | 'desc'
): Promise<{
  count: number
  transactions: Array<DecodedChatMessageTransaction>
}>

type DecodedChatMessageTransaction = ChatMessageTransaction & {
  message: string | object
  i18n: boolean
}

export function decodeChat(
  transaction: ChatMessageTransaction,
  key: string
): DecodedChatMessageTransaction

export function decodeTransaction(
  transaction: AnyTransaction | QueuedTransaction,
  address: string
): DecodedChatMessageTransaction

export function getI18nMessage(message: string, senderId: string): string

export function loginOrRegister(): Promise<ReturnType<typeof getCurrentAccount>>

export type CurrentAccountWithPassphrase = CurrentAccount & {
  passphrase: string
}

export function loginViaPassword(
  password: string,
  store: Store<RootState>
): Promise<CurrentAccountWithPassphrase>

type GetChatRoomsParams = Pick<ChatsApiGetChatRoomsRequest, 'offset' | 'limit' | 'orderBy'>

export function getChatRooms(
  address: string,
  params: GetChatRoomsParams
): Promise<Array<ReturnType<typeof decodeChat>>>

type GetChatRoomMessagesParams = Pick<
  ChatsApiGetChatroomMessagesRequest,
  'offset' | 'limit' | 'orderBy'
>

export function getChatRoomMessages(
  address1: string,
  address2: string,
  params: GetChatRoomMessagesParams,
  recursive: boolean = false
): Promise<Array<ReturnType<typeof decodeChat>>>
