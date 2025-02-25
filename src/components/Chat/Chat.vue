<template>
  <v-card class="chat">
    <free-tokens-dialog v-model="showFreeTokensDialog" />
    <a-chat
      ref="chatRef"
      :messages="messages"
      :partners="partners"
      :user-id="userId"
      :loading="loading"
      :locale="$i18n.locale"
      @scroll:top="onScrollTop"
      @scroll:bottom="onScrollBottom"
      @scroll="onScroll"
    >
      <template #overlay v-if="actionMessage">
        <a-chat-actions-overlay
          :modelValue="actionsMenuMessageId !== -1"
          @update:modelValue="closeActionsMenu"
          :transaction="actionMessage"
        >
          <a-chat-message
            v-if="actionMessage.type === 'message'"
            :transaction="actionMessage"
            :data-id="'action-message'"
            html
            disable-max-width
            elevation
          >
            <template #avatar>
              <ChatAvatar :user-id="partnerId" use-public-key @click="onClickAvatar(partnerId)" />
            </template>
          </a-chat-message>

          <a-chat-transaction
            v-else-if="isTransaction(actionMessage.type)"
            :transaction="actionMessage"
            :data-id="'action-message'"
            disable-max-width
            elevation
          >
            <template #crypto>
              <crypto-icon :crypto="actionMessage.type" />
            </template>
          </a-chat-transaction>

          <template #top>
            <EmojiPicker
              v-if="showEmojiPicker"
              @emoji:select="(emoji) => onEmojiSelect(actionMessage.id, emoji)"
              elevation
              position="absolute"
            />

            <AChatReactionSelect
              v-else
              :transaction="actionMessage"
              @reaction:add="sendReaction"
              @reaction:remove="removeReaction"
              @click:emoji-picker="showEmojiPicker = true"
            />
          </template>

          <template #bottom>
            <AChatMessageActionsMenu
              v-if="!showEmojiPicker"
              @click:reply="openReplyPreview(actionMessage)"
              @click:copy="copyMessageToClipboard(actionMessage)"
            />
          </template>
        </a-chat-actions-overlay>
      </template>

      <template #header>
        <chat-toolbar :partner-id="partnerId">
          <template #avatar-toolbar>
            <ChatAvatar
              class="chat-avatar"
              :user-id="partnerId"
              use-public-key
              @click="onClickAvatar(partnerId)"
            />
          </template>
        </chat-toolbar>
      </template>

      <template #message="{ message, sender }">
        <a-chat-message
          v-if="message.type === 'message'"
          :transaction="message"
          :html="true"
          :flashing="flashingMessageId === message.id"
          :data-id="message.id"
          :swipe-disabled="isWelcomeMessage(message)"
          @resend="resendMessage(partnerId, message.id)"
          @click:quoted-message="onQuotedMessageClick"
          @swipe:left="onSwipeLeft(message)"
          @longpress="onMessageLongPress(message)"
        >
          <template #avatar>
            <ChatAvatar :user-id="sender.id" use-public-key @click="onClickAvatar(sender.id)" />
          </template>

          <template #actions v-if="isRealMessage(message)">
            <AChatReactions @click="handleClickReactions(message)" :transaction="message" />

            <AChatMessageActionsDropdown
              :transaction="message"
              :open="actionsDropdownMessageId === message.id"
              @open:change="toggleActionsDropdown"
              @click:reply="openReplyPreview(message)"
              @click:copy="copyMessageToClipboard(message)"
            >
              <template #top>
                <EmojiPicker
                  v-if="showEmojiPicker"
                  @emoji:select="(emoji) => onEmojiSelect(message.id, emoji)"
                  elevation
                  position="absolute"
                />

                <AChatReactionSelect
                  v-else
                  :transaction="message"
                  @reaction:add="sendReaction"
                  @reaction:remove="removeReaction"
                  @click:emoji-picker="showEmojiPicker = true"
                />
              </template>

              <template #bottom>
                <AChatMessageActionsList
                  v-if="!showEmojiPicker"
                  @click:reply="openReplyPreview(message)"
                  @click:copy="copyMessageToClipboard(message)"
                />
              </template>
            </AChatMessageActionsDropdown>
          </template>
        </a-chat-message>

        <a-chat-attachment
          v-if="message.type === 'attachment'"
          :transaction="message"
          :html="true"
          :flashing="flashingMessageId === message.id"
          :data-id="message.id"
          :partner-id="partnerId"
          @resend="() => console.debug('Not implemented')"
          @click:quoted-message="onQuotedMessageClick"
          @swipe:left="onSwipeLeft(message)"
          @longpress="onMessageLongPress(message)"
        >
          <template #avatar>
            <ChatAvatar :user-id="sender.id" use-public-key @click="onClickAvatar(sender.id)" />
          </template>

          <template #actions v-if="isRealMessage(message)">
            <AChatReactions @click="handleClickReactions(message)" :transaction="message" />

            <AChatMessageActionsDropdown
              :transaction="message"
              :open="actionsDropdownMessageId === message.id"
              @open:change="toggleActionsDropdown"
              @click:reply="openReplyPreview(message)"
              @click:copy="copyMessageToClipboard(message)"
            >
              <template #top>
                <EmojiPicker
                  v-if="showEmojiPicker"
                  @emoji:select="(emoji) => onEmojiSelect(message.id, emoji)"
                  elevation
                  position="absolute"
                />

                <AChatReactionSelect
                  v-else
                  :transaction="message"
                  @reaction:add="sendReaction"
                  @reaction:remove="removeReaction"
                  @click:emoji-picker="showEmojiPicker = true"
                />
              </template>

              <template #bottom>
                <AChatMessageActionsList
                  v-if="!showEmojiPicker"
                  @click:reply="openReplyPreview(message)"
                  @click:copy="copyMessageToClipboard(message)"
                />
              </template>
            </AChatMessageActionsDropdown>
          </template>
        </a-chat-attachment>

        <a-chat-transaction
          v-else-if="isTransaction(message.type)"
          :transaction="message"
          :flashing="flashingMessageId === message.id"
          :data-id="message.id"
          :swipe-disabled="isWelcomeMessage(message)"
          @click:transaction="openTransaction(message)"
          @click:quoted-message="onQuotedMessageClick"
          @swipe:left="onSwipeLeft(message)"
          @longpress="onMessageLongPress(message)"
        >
          <template #crypto>
            <crypto-icon :crypto="message.type" />
          </template>

          <template #actions v-if="isRealMessage(message)">
            <AChatReactions @click="handleClickReactions(message)" :transaction="message" />

            <AChatMessageActionsDropdown
              :transaction="message"
              :open="actionsDropdownMessageId === message.id"
              @open:change="toggleActionsDropdown"
              @click:reply="openReplyPreview(message)"
              @click:copy="copyMessageToClipboard(message)"
            >
              <template #top>
                <EmojiPicker
                  v-if="showEmojiPicker"
                  @emoji:select="(emoji) => onEmojiSelect(message.id, emoji)"
                  elevation
                  position="absolute"
                />

                <AChatReactionSelect
                  v-else
                  :transaction="message"
                  @reaction:add="sendReaction"
                  @reaction:remove="removeReaction"
                  @click:emoji-picker="showEmojiPicker = true"
                />
              </template>

              <template #bottom>
                <AChatMessageActionsList
                  v-if="!showEmojiPicker"
                  @click:reply="openReplyPreview(message)"
                  @click:copy="copyMessageToClipboard(message)"
                />
              </template>
            </AChatMessageActionsDropdown>
          </template>
        </a-chat-transaction>
      </template>

      <template #form>
        <a-chat-form
          v-if="!isWelcomeChat(partnerId)"
          ref="chatFormRef"
          :show-send-button="true"
          :send-on-enter="sendMessageOnEnter"
          :show-divider="true"
          :label="t('chats.message')"
          :message-text="
            $route.query.messageText || $store.getters['draftMessage/draftMessage'](partnerId)
          "
          @message="onMessage"
          @error="onMessageError"
          @esc="replyMessageId = -1"
          :validator="validateMessage"
          :partner-id="partnerId"
        >
          <template #append>
            <chat-menu
              class="chat-menu"
              :partner-id="partnerId"
              :reply-to-id="replyMessageId !== -1 ? replyMessageId : undefined"
              @files="handleAttachments"
            />
          </template>

          <template #preview-file>
            <FilesPreview
              v-if="attachments.list.length > 0"
              :files="attachments.list"
              @remove-item="attachments.remove"
              @cancel="cancelPreviewFile"
            />
          </template>

          <template #reply-preview v-if="replyMessage">
            <a-chat-reply-preview
              :partner-id="partnerId"
              :message="replyMessage"
              @cancel="cancelReplyMessage"
            />
          </template>
        </a-chat-form>
      </template>

      <template #fab>
        <v-badge
          :modelValue="numOfNewMessages > 0"
          floating
          location="top center"
          v-if="!isScrolledToBottom"
          color="primary"
          :content="numOfNewMessages > 0 ? numOfNewMessages : undefined"
        >
          <v-btn
            class="ma-0 grey--text"
            color="grey lighten-3"
            icon
            depressed
            fab
            size="small"
            @click="chatRef.scrollToBottom()"
          >
            <v-icon :icon="mdiChevronDown" size="x-large" />
          </v-btn>
        </v-badge>
      </template>
    </a-chat>
    <ProgressIndicator :show="replyLoadingChatHistory" />
  </v-card>
</template>

<script lang="ts" setup>
import AChatMessageActionsList from '@/components/AChat/AChatMessageActionsList.vue'
import AChatReactions from '@/components/AChat/AChatReactions/AChatReactions.vue'
import { FileData } from '@/lib/files'
import { emojiWeight } from '@/lib/chat/emoji-weight/emojiWeight'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { vibrate } from '@/lib/vibrate'
import { useAttachments } from '@/stores/attachments'
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Visibility from 'visibilityjs'
import copyToClipboard from 'copy-to-clipboard'

import { Cryptos, Fees, UPLOAD_MAX_FILE_COUNT, UPLOAD_MAX_FILE_SIZE } from '@/lib/constants'
import EmojiPicker from '@/components/EmojiPicker.vue'

import { mdiChevronDown } from '@mdi/js'

import {
  AChat,
  AChatMessage,
  AChatTransaction,
  AChatForm,
  AChatReplyPreview,
  AChatMessageActionsMenu,
  AChatMessageActionsDropdown,
  AChatActionsOverlay,
  AChatReactionSelect,
  FilesPreview
} from '@/components/AChat'
import ChatToolbar from '@/components/Chat/ChatToolbar.vue'
import ChatAvatar from '@/components/Chat/ChatAvatar.vue'
import ChatMenu from '@/components/Chat/ChatMenu.vue'
import CryptoIcon from '@/components/icons/CryptoIcon.vue'
import FreeTokensDialog from '@/components/FreeTokensDialog.vue'
import { isMobile } from '@/lib/display-mobile'
import { isAdamantChat, isWelcomeChat, isWelcomeMessage } from '@/lib/chat/meta/utils'
import ProgressIndicator from '@/components/ProgressIndicator.vue'
import AChatAttachment from '@/components/AChat/AChatAttachment/AChatAttachment.vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const validationErrors = {
  emptyMessage: 'EMPTY_MESSAGE',
  notEnoughFunds: 'NON_ENOUGH_FUNDS',
  notEnoughFundsNewAccount: 'NON_ENOUGH_FUNDS_NEW_ACCOUNT',
  messageTooLong: 'MESSAGE_LENGTH_EXCEED'
}

const props = defineProps({
  partnerId: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['click:chat-avatar'])

const router = useRouter()
const store = useStore()
const { t } = useI18n()

const attachments = useAttachments(props.partnerId)()
const handleAttachments = (files: FileData[]) => {
  const maxFileSizeExceeded = files.some(({ file }) => file.size >= UPLOAD_MAX_FILE_SIZE)
  const maxFileCountExceeded = attachments.list.length + files.length > UPLOAD_MAX_FILE_COUNT

  attachments.add(files)

  if (maxFileCountExceeded) {
    store.dispatch('snackbar/show', {
      message: t('chats.max_files', { count: UPLOAD_MAX_FILE_COUNT })
    })
  } else if (maxFileSizeExceeded) {
    store.dispatch('snackbar/show', {
      message: t('chats.max_file_size', { count: UPLOAD_MAX_FILE_SIZE })
    })
  }

  chatFormRef.value.focus()
}
const hasAttachment = computed(() => attachments.list.length > 0)

const loading = ref(false)
const replyLoadingChatHistory = ref(false)
const noMoreMessages = ref(false)
const isScrolledToBottom = ref(true)
const visibilityId = ref<number | boolean | null>(null)
const showFreeTokensDialog = ref(false)
const flashingMessageId = ref<string | -1>(-1)
const actionsMenuMessageId = ref<string | -1>(-1)
const actionsDropdownMessageId = ref<string | -1>(-1)
const replyMessageId = ref<string | -1>(-1)
const showEmojiPicker = ref(false)

const messages = computed(() => store.getters['chat/messages'](props.partnerId))
const userId = computed(() => store.state.address)

const getPartnerName = (address: string) => {
  const name: string = store.getters['partners/displayName'](address) || ''

  return isAdamantChat(address) ? t(name) : name
}
const getUserMeta = (address: string) => ({
  id: address,
  name: address === userId.value ? t('chats.you') : getPartnerName(address)
})
const partners = computed(() => [getUserMeta(userId.value), getUserMeta(props.partnerId)])
const sendMessageOnEnter = computed<boolean>(() => store.state.options.sendMessageOnEnter)
const isFulfilled = computed<boolean>(() => store.state.chat.isFulfilled)
const lastMessage = computed<NormalizedChatMessageTransaction>(() =>
  store.getters['chat/lastMessage'](props.partnerId)
)
const chatPage = computed<number>(() => store.getters['chat/chatPage'](props.partnerId))
const scrollPosition = computed<number | false>(() =>
  store.getters['chat/scrollPosition'](props.partnerId)
)
const numOfNewMessages = computed<number>(() =>
  store.getters['chat/numOfNewMessages'](props.partnerId)
)
const replyMessage = computed<NormalizedChatMessageTransaction>(() =>
  store.getters['chat/messageById'](replyMessageId.value)
)
const actionMessage = computed<NormalizedChatMessageTransaction>(() =>
  store.getters['chat/messageById'](actionsMenuMessageId.value)
)

const chatFormRef = ref<any>(null) // @todo type
const chatRef = ref<any>(null) // @todo type
// Scroll to the bottom every time window focused by desktop notification
watch(
  () => store.state.notification.desktopActivateClickCount,
  () => {
    nextTick(() => {
      chatRef.value.scrollToBottom()
    })
  }
)

watch(lastMessage, () => {
  nextTick(() => {
    if (isScrolledToBottom.value) {
      chatRef.value.scrollToBottom()
    }

    if (!Visibility.hidden() && isScrolledToBottom.value) markAsRead()
  })
})

watch(isFulfilled, (value) => {
  if (value && (!chatPage.value || chatPage.value <= 0)) fetchChatMessages()
})

watch(replyMessageId, (messageId) => {
  router.replace({
    name: 'Chat',
    query: {
      replyToId: messageId === -1 ? undefined : messageId
    }
  })
})

onBeforeMount(() => {
  window.addEventListener('keyup', onKeyPress)
})
onMounted(() => {
  if (isFulfilled.value && chatPage.value <= 0) fetchChatMessages()
  scrollBehavior()
  nextTick(() => {
    isScrolledToBottom.value = chatRef.value.isScrolledToBottom()
  })
  visibilityId.value = Visibility.change((event, state) => {
    if (state === 'visible' && isScrolledToBottom.value) markAsRead()
  })

  const draftMessage = store.getters['draftMessage/draftReplyTold'](props.partnerId)
  if (draftMessage) {
    replyMessageId.value = draftMessage
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keyup', onKeyPress)
  Visibility.unbind(Number(visibilityId.value))
})

/**
 * Validate message before sending.
 * @param message
 * @returns If `false` then validation passed without errors.
 */
function validateMessage(message: string): string | false {
  if (hasAttachment.value) {
    // When attaching files, the message is not mandatory
    return false
  }

  // Ensure that message contains at least one non-whitespace character
  if (!message.trim().length) {
    return validationErrors.emptyMessage
  }

  const isNewAccount = store.getters.isAccountNew()
  const balance = isNewAccount ? store.state.unconfirmedBalance : store.state.balance

  if (balance < Fees.NOT_ADM_TRANSFER) {
    if (isNewAccount) {
      return validationErrors.notEnoughFundsNewAccount
    } else {
      return validationErrors.notEnoughFunds
    }
  }

  if (message.length * 1.5 > 20000) {
    return validationErrors.messageTooLong
  }

  return false
}

const onMessage = (message: string) => {
  sendMessage(message)
  replyMessageId.value = -1
  attachments.$reset()
  setTimeout(() => chatRef.value.scrollToBottom())
}
const cancelPreviewFile = () => {
  attachments.$reset()
}
const onMessageError = (error: string) => {
  switch (error) {
    case validationErrors.notEnoughFundsNewAccount:
      showFreeTokensDialog.value = true
      return
    case validationErrors.notEnoughFunds:
      store.dispatch('snackbar/show', { message: t('chats.no_money') })
      return
    case validationErrors.messageTooLong:
      store.dispatch('snackbar/show', {
        message: t('chats.too_long')
      })
      return
  }
}

const cancelReplyMessage = () => {
  replyMessageId.value = -1
  store.commit('draftMessage/deleteReplyTold', {
    replyToId: replyMessageId.value,
    partnerId: props.partnerId
  })
}

const sendMessage = (message: string) => {
  store.dispatch('draftMessage/deleteDraft', { partnerId: props.partnerId })
  const replyToId = replyMessageId.value !== -1 ? replyMessageId.value : undefined

  if (attachments.list.length > 0) {
    store.dispatch('chat/sendAttachment', {
      files: attachments.list,
      message,
      recipientId: props.partnerId,
      replyToId
    })

    return
  }

  return store
    .dispatch('chat/sendMessage', {
      message,
      recipientId: props.partnerId,
      replyToId
    })
    .catch((err) => {
      console.error(err.message)
    })
}

const resendMessage = (recipientId: string, messageId: string) => {
  return store.dispatch('chat/resendMessage', { recipientId, messageId }).catch((err) => {
    store.dispatch('snackbar/show', {
      message: err.message
    })
    console.error(err.message)
  })
}

const sendReaction = (reactToId: string, emoji: string) => {
  closeActionsMenu()
  closeActionsDropdown()
  emojiWeight.addReaction(emoji)
  return store.dispatch('chat/sendReaction', {
    recipientId: props.partnerId,
    reactToId,
    reactMessage: emoji
  })
}

const removeReaction = (reactToId: string, emoji: string) => {
  closeActionsMenu()
  closeActionsDropdown()
  emojiWeight.removeReaction(emoji)
  return store.dispatch('chat/sendReaction', {
    recipientId: props.partnerId,
    reactToId,
    reactMessage: ''
  })
}

const onEmojiSelect = (transactionId: string, emoji: string) => {
  sendReaction(transactionId, emoji)
}

const markAsRead = () => {
  store.commit('chat/markAsRead', props.partnerId)
}

const onScrollTop = () => {
  fetchChatMessages()
}

const onScrollBottom = () => {
  markAsRead()
}

const onScroll = (scrollPosition: number, isBottom: boolean) => {
  isScrolledToBottom.value = isBottom
  store.commit('chat/updateScrollPosition', {
    contactId: props.partnerId,
    scrollPosition
  })
}

const onClickAvatar = (address: string) => {
  emit('click:chat-avatar', address)
}

const onQuotedMessageClick = async (transactionId: string) => {
  let transactionIndex = store.getters['chat/indexOfMessage'](props.partnerId, transactionId)

  // if the message is not present in the store
  // fetch chat history until reach that message
  if (transactionIndex === -1) {
    await fetchUntilFindTransaction(transactionId)

    transactionIndex = store.getters['chat/indexOfMessage'](props.partnerId, transactionId)
  }

  // if after fetching chat history the message still cannot be found
  // then do nothing
  if (transactionIndex === -1) {
    console.warn(
      'onQuotedMessageClick: Transaction not found in the chat history',
      `tx.id="${transactionId}"`
    )
    return
  }

  await chatRef.value.scrollToMessageEasy(transactionIndex)
  highlightMessage(transactionId)
}

const onMessageLongPress = (transaction: NormalizedChatMessageTransaction) => {
  if (isWelcomeMessage(transaction)) return

  openActionsMenu(transaction)
  vibrate.veryShort()
}

const onSwipeLeft = (message: NormalizedChatMessageTransaction) => {
  if (isWelcomeMessage(message)) return

  openReplyPreview(message)
  vibrate.veryShort()
}

const openActionsMenu = (transaction: NormalizedChatMessageTransaction) => {
  actionsMenuMessageId.value = transaction.id
}

const closeActionsMenu = () => {
  actionsMenuMessageId.value = -1
  showEmojiPicker.value = false
}

const openActionsDropdown = (transaction: NormalizedChatMessageTransaction) => {
  actionsDropdownMessageId.value = transaction.id
}

const closeActionsDropdown = () => {
  actionsDropdownMessageId.value = -1
  showEmojiPicker.value = false
}

const toggleActionsDropdown = (open: boolean, transaction: NormalizedChatMessageTransaction) => {
  if (open) {
    openActionsDropdown(transaction)
  } else {
    closeActionsDropdown()
  }
}

const handleClickReactions = (transaction: NormalizedChatMessageTransaction) => {
  if (isMobile()) {
    openActionsMenu(transaction)
  } else {
    toggleActionsDropdown(true, transaction)
  }
}

const openReplyPreview = (message: NormalizedChatMessageTransaction) => {
  closeActionsMenu()
  closeActionsDropdown()

  replyMessageId.value = message.id
  chatFormRef.value.focus()
  store.commit('draftMessage/saveReplyToId', {
    replyToId: message.id,
    partnerId: props.partnerId
  })
}

const copyMessageToClipboard = ({ message }: NormalizedChatMessageTransaction) => {
  closeActionsMenu()
  closeActionsDropdown()

  copyToClipboard(message)
  store.dispatch('snackbar/show', { message: t('home.copied'), timeout: 1000 })
}

const isRealMessage = (transaction: NormalizedChatMessageTransaction) => {
  return !isWelcomeMessage(transaction)
}

const highlightMessage = (transactionId: string) => {
  flashingMessageId.value = transactionId

  setTimeout(() => {
    flashingMessageId.value = -1
  }, 1000)
}

const openTransaction = (transaction: NormalizedChatMessageTransaction) => {
  if (transaction.type in Cryptos) {
    router.push({
      name: 'Transaction',
      params: {
        crypto: transaction.type,
        txId: transaction.hash
      },
      query: {
        fromChat: 'true'
      }
    })
  }
}

const isTransaction = (type: string) => {
  return type in Cryptos || type === 'UNKNOWN_CRYPTO'
}
const fetchChatMessages = () => {
  if (noMoreMessages.value) return
  if (loading.value) return

  loading.value = true

  return store
    .dispatch('chat/getChatRoomMessages', { contactId: props.partnerId })
    .catch(() => {
      noMoreMessages.value = true
    })
    .finally(() => {
      loading.value = false
      chatRef.value.maintainScrollPosition()
    })
}
const fetchUntilFindTransaction = (transactionId: string) => {
  const fetchMessages = async () => {
    await store.dispatch('chat/getChatRoomMessages', { contactId: props.partnerId })

    chatRef.value.maintainScrollPosition()

    const transactionFound = store.getters['chat/partnerMessageById'](
      props.partnerId,
      transactionId
    )
    if (transactionFound) return

    if (store.state.chat.offset > -1) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return fetchMessages()
    }
  }

  replyLoadingChatHistory.value = true

  return fetchMessages()
    .catch(() => {
      noMoreMessages.value = true
    })
    .finally(() => {
      replyLoadingChatHistory.value = false
    })
}

const scrollBehavior = () => {
  nextTick(() => {
    if (numOfNewMessages.value > 0) {
      chatRef.value.scrollToMessage(numOfNewMessages.value - 1)
    } else if (scrollPosition.value !== false) {
      chatRef.value.scrollTo(scrollPosition.value)
    } else {
      chatRef.value.scrollToBottom()
    }

    markAsRead()
  })
}
const onKeyPress = (e: KeyboardEvent) => {
  if (e.code === 'Enter' && !showFreeTokensDialog.value) chatFormRef.value.focus()
}
</script>

<style scoped lang="scss">
.chat-menu {
  margin-right: 8px;
}
.chat {
  height: 100vh;
  box-shadow: none;
  background-color: transparent !important;
}

.chat-avatar {
  margin-right: 12px;
}
</style>
