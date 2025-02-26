<template>
  <div :class="classes.root">
    <div :class="classes.container">
      <div :class="classes.avatar">
        <ChatAvatar :user-id="message.senderId" use-public-key />
      </div>

      <div :class="classes.message">
        <span v-if="!isCryptoTransfer" v-html="messageLabel"></span>
        <span v-else>{{ cryptoTransferLabel }}</span>
      </div>

      <v-btn
        @click="$emit('cancel')"
        :class="classes.closeButton"
        :icon="mdiClose"
        size="24"
        variant="plain"
      />
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ChatAvatar from '@/components/Chat/ChatAvatar.vue'
import { Cryptos } from '@/lib/constants'
import currencyFormatter from '@/filters/currencyAmountWithSymbol'
import { formatMessage } from '@/lib/markdown'
import { mdiClose } from '@mdi/js'

const className = 'a-chat-reply-preview'
const classes = {
  root: className,
  container: `${className}__container`,
  message: `${className}__message`,
  avatar: `${className}__avatar`,
  closeButton: `${className}__close-button`
}

export default defineComponent({
  components: {
    ChatAvatar
  },
  emits: ['cancel'],
  props: {
    message: {
      type: Object,
      required: true
    },
    partnerId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n()
    const store = useStore()

    const isCryptoTransfer = computed(() => {
      const validCryptos = Object.keys(Cryptos)

      return props.message ? validCryptos.includes(props.message.type) : false
    })

    const cryptoTransferLabel = computed(() => {
      const direction =
        props.message.senderId === props.partnerId
          ? t('chats.received_label')
          : t('chats.sent_label')
      const amount = currencyFormatter(props.message.amount, props.message.type)
      const message = props.message.message ? `: ${props.message.message}` : ''

      return `${direction} ${amount}${message}`
    })

    const messageLabel = computed(() => {
      return store.state.options.formatMessages
        ? formatMessage(props.message.message)
        : props.message.message
    })

    return {
      isCryptoTransfer,
      cryptoTransferLabel,
      classes,
      messageLabel,
      mdiClose
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/settings/_colors.scss';
@import '@/assets/styles/themes/adamant/_mixins.scss';

$message-max-lines: 2;

.a-chat-reply-preview {
  border-left: 3px solid map-get($adm-colors, 'attention');
  border-radius: 8px;
  margin: 8px;

  &__container {
    padding: 8px 16px;
    position: relative;
    display: flex;
  }

  &__message {
    @include a-text-regular-enlarged();
    line-height: 20px; // half of <ChatAvatar/> height

    margin-left: 8px;
    margin-right: 8px;

    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: $message-max-lines;
    -webkit-box-orient: vertical;
  }

  &__close-button {
    position: absolute;
    right: 0;
    top: 0;
    margin-right: 4px;
    margin-top: 4px;
  }
}

.v-theme--light {
  .a-chat-reply-preview {
    background-color: map-get($adm-colors, 'secondary');
    color: map-get($adm-colors, 'regular');
  }
}

.v-theme--dark {
  .a-chat-reply-preview {
    background-color: rgba(245, 245, 245, 0.1); // @todo const
    color: #fff;
  }
}
</style>
