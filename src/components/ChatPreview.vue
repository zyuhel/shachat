<template>
  <v-list-item v-if="isLoadingSeparator">
    <div class="d-flex justify-center">
      <v-icon
        ref="loadingDots"
        :class="{ kmove: isLoadingSeparatorActive }"
        :icon="mdiDotsHorizontal"
      />
    </div>
  </v-list-item>
  <v-list-item v-else lines="two" :class="className" @click="$emit('click')">
    <template #prepend>
      <icon v-if="isWelcomeChat(contactId)" :class="`${className}__icon`">
        <adm-fill-icon />
      </icon>
      <div v-else :class="`${className}__chat-avatar`">
        <chat-avatar :size="40" :user-id="contactId" use-public-key />
      </div>

      <v-badge
        :class="`${className}__badge`"
        v-if="numOfNewMessages > 0"
        overlap
        color="primary"
        :content="numOfNewMessages > 99 ? '99+' : numOfNewMessages"
      />
    </template>

    <div>
      <div :class="`${className}__heading`">
        <v-list-item-title
          :class="{
            'a-text-regular-enlarged-bold': true,
            [`${className}__title`]: true
          }"
          >{{ chatName }}</v-list-item-title
        >
        <div v-if="!isMessageReadonly" :class="`${className}__date`">
          {{ formatDate(createdAt) }}
        </div>
      </div>

      <!-- New chat (no messages yet) -->
      <template v-if="isNewChat">
        <v-list-item-subtitle>&nbsp;</v-list-item-subtitle>
      </template>

      <!-- Transaction -->
      <template v-else-if="isTransferType">
        <TransactionProvider :transaction="transaction">
          <template #default="{ status }">
            <v-list-item-subtitle :class="`${className}__subtitle`">
              <v-icon v-if="!isIncomingTransaction" size="15" :icon="tsIcon(status)" />
              {{ transactionDirection }} {{ currency(transaction.amount, transaction.type) }}
              <v-icon v-if="isIncomingTransaction" size="15" :icon="tsIcon(status)" />
            </v-list-item-subtitle>
          </template>
        </TransactionProvider>
      </template>
      <!-- Attachment -->
      <template v-else-if="isAttachment">
        <v-list-item-subtitle :class="`${className}__subtitle`">
          {{ attachmentText }}
        </v-list-item-subtitle>
      </template>
      <!-- Reaction -->
      <template v-else-if="isReaction">
        <v-list-item-subtitle :class="`${className}__subtitle`">
          {{ reactedText }}
        </v-list-item-subtitle>
      </template>

      <!-- Message -->
      <template v-else>
        <v-list-item-subtitle
          :class="['a-text-explanation-enlarged-bold', `${className}__subtitle`]"
        >
          <template v-if="isOutgoingTransaction">
            <v-icon
              v-if="transaction.isReply && isConfirmed"
              :icon="mdiArrowLeftTop"
              size="15"
              class="mr-1"
            />
            <v-icon v-else :icon="admStatusIcon" size="15" class="mr-1" />
          </template>

          <span v-html="lastMessageTextNoFormats"></span>
        </v-list-item-subtitle>
      </template>
    </div>
  </v-list-item>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import AdmFillIcon from '@/components/icons/AdmFill.vue'
import ChatAvatar from '@/components/Chat/ChatAvatar.vue'
import Icon from '@/components/icons/BaseIcon.vue'
import currency from '@/filters/currencyAmountWithSymbol'
import formatDate from '@/filters/dateBrief'
import { formatMessage } from '@/lib/markdown'
import { isAdamantChat, isWelcomeChat } from '@/lib/chat/meta/utils'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { isStringEqualCI } from '@/lib/textHelpers'
import { tsIcon, TransactionStatus as TS } from '@/lib/constants'
import { useChatName } from '@/components/AChat/hooks/useChatName'
import { TransactionProvider } from '@/providers/TransactionProvider'
import { mdiArrowLeftTop, mdiDotsHorizontal } from '@mdi/js'

const className = 'chat-brief'

export default defineComponent({
  components: {
    TransactionProvider,
    ChatAvatar,
    Icon,
    AdmFillIcon
  },
  props: {
    /**
     * Account owner ID
     */
    userId: {
      type: String,
      required: true
    },
    /**
     * Contact ID with whom the chat is held
     */
    contactId: {
      type: String,
      required: true
    },
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    isMessageReadonly: {
      type: Boolean,
      default: false
    },
    /**
     * Must be defined if is an ADAMANT chat
     */
    adamantChatMeta: {
      type: Object,
      default: null
    },
    isLoadingSeparator: {
      type: Boolean,
      default: false
    },
    isLoadingSeparatorActive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props) {
    const store = useStore()
    const { t } = useI18n()

    const contactId = computed(() => props.contactId)
    const chatName = useChatName(contactId, true)

    const isTransferType = computed(
      () =>
        props.transaction.type !== 'message' &&
        props.transaction.type !== 'reaction' &&
        props.transaction.type !== 'attachment'
    )
    const isAttachment = computed(() => props.transaction.type === 'attachment')
    const attachmentText = computed(() => {
      if (!isAttachment.value) return ''
      const filesCount = props.transaction.asset.files.length

      if (props.transaction.message) {
        return `[${t('chats.file', filesCount)}]: ${props.transaction.message}`
      }

      return `${t('chats.attached')}: ${t('chats.file', filesCount)}`
    })
    const isReaction = computed(() => props.transaction.type === 'reaction')

    const reactedText = computed(() => {
      const reaction = props.transaction.asset.react_message
      const isRemoveReaction = !reaction

      if (isRemoveReaction) {
        const label = isOutgoingTransaction.value
          ? `${t('chats.you')}: ${t('chats.you_removed_reaction')}`
          : t('chats.partner_removed_reaction')

        return label
      } else {
        const label = isOutgoingTransaction.value
          ? `${t('chats.you')}: ${t('chats.you_reacted')}`
          : t('chats.partner_reacted')

        return `${label} ${reaction}`
      }
    })
    const isNewChat = computed(() => !props.transaction.type)
    const isMessageI18n = computed(() => props.transaction.i18n)

    const lastMessageText = computed(() => props.transaction.message || '')
    const lastMessageTextLocalized = computed(() =>
      isMessageI18n.value ? t(lastMessageText.value) : lastMessageText.value
    )
    const lastMessageTextNoFormats = computed(() => {
      if (isAdamantChat(contactId.value) || store.state.options.formatMessages) {
        return formatMessage(lastMessageTextLocalized.value)
      }

      return lastMessageTextLocalized.value
    })
    const transactionDirection = computed(() => {
      const direction = isStringEqualCI(props.userId, props.transaction.senderId)
        ? t('chats.sent_label')
        : t('chats.received_label')

      return direction
    })
    const isIncomingTransaction = computed(
      () => !isStringEqualCI(props.userId, props.transaction.senderId)
    )
    const isOutgoingTransaction = computed(() => !isIncomingTransaction.value)
    const numOfNewMessages = computed(() => store.getters['chat/numOfNewMessages'](contactId.value))
    const createdAt = computed(() => props.transaction.timestamp)

    const status = computed(() => props.transaction.status)
    const admStatusIcon = computed(() => tsIcon(status.value))
    const isConfirmed = computed(() => status.value === TS.CONFIRMED)

    return {
      className,
      chatName,
      t,
      createdAt,
      currency,
      formatDate,
      isAdamantChat,
      isConfirmed,
      isIncomingTransaction,
      isNewChat,
      isOutgoingTransaction,
      isAttachment,
      attachmentText,
      isReaction,
      isTransferType,
      isWelcomeChat,
      lastMessageTextNoFormats,
      numOfNewMessages,
      reactedText,
      admStatusIcon,
      transactionDirection,
      mdiArrowLeftTop,
      mdiDotsHorizontal,
      tsIcon
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import '@/assets/styles/settings/_colors.scss';

@keyframes movement {
  from {
    left: -50px;
  }
  to {
    left: 50px;
  }
}

.kmove {
  position: relative;
  animation-name: movement;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

/**
 * 1. Message/Transaction content.
 */
.chat-brief {
  position: relative;

  &__chat-avatar {
    margin-right: 16px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    margin-right: 16px;
  }

  &__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    line-height: 24px;
    margin-bottom: 0;
  }

  &__subtitle {
    line-height: 1.5;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    @include a-text-explanation-small();
    margin-left: 16px;
    white-space: nowrap;
  }

  &__badge {
    :deep(.v-badge__badge) {
      left: calc(100% - 12px - 16px) !important;
      font-size: 14px;
      width: 22px;
      height: 22px;
    }
  }

  :deep(.v-list-item-subtitle) {
    @include a-text-explanation-enlarged-bold();
  }
}

/** Themes **/
.v-theme--light {
  .chat-brief {
    border-bottom: 1px solid map-get($adm-colors, 'secondary2');

    &__date {
      color: map-get($adm-colors, 'muted');
    }

    &__icon {
      fill: #bdbdbd;
    }

    :deep(.v-list-item-subtitle) {
      color: map-get($adm-colors, 'muted');
    }
  }
}
.v-theme--dark {
  .chat-brief {
    :deep(.v-list-item-subtitle) {
      color: map-get($adm-colors, 'grey-transparent');
    }
  }
}
</style>
