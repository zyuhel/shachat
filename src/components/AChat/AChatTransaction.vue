<template>
  <div
    class="a-chat__message-container"
    :class="{
      'a-chat__message-container--right': isStringEqualCI(transaction.senderId, userId),
      'a-chat__message-container--transition': elementLeftOffset === 0,
      'a-chat__message-container--disable-max-width': disableMaxWidth
    }"
    v-touch="{
      move: onMove,
      end: onSwipeEnd
    }"
    :style="{
      left: swipeDisabled ? '0px' : `${elementLeftOffset}px`
    }"
    v-longpress="onLongPress"
  >
    <div
      class="a-chat__message"
      :class="{
        'a-chat__message--flashing': flashing,
        'elevation-9': elevation
      }"
      :data-id="dataId"
    >
      <div class="a-chat__message-card">
        <div class="a-chat__message-card-header">
          <div class="a-chat__timestamp">
            {{ time }}
          </div>
          <div class="a-chat__status">
            <TransactionProvider :transaction="transaction">
              <template #default="{ status, refetch }">
                <v-icon
                  size="13"
                  :icon="tsIcon(status)"
                  :title="t(`chats.transaction_statuses.${status}`)"
                  :color="tsColor(status)"
                  :style="checkStatusUpdatable(status) ? 'cursor: pointer;' : 'cursor: default;'"
                  @click="checkStatusUpdatable(status) ? refetch() : undefined"
                />
              </template>
            </TransactionProvider>
          </div>
        </div>

        <div v-if="transaction.isReply" class="a-chat__quoted-message">
          <quoted-message
            :message-id="transaction.asset.replyto_id"
            @click="$emit('click:quotedMessage', transaction.asset.replyto_id)"
          />
        </div>

        <div>
          <div class="a-chat__direction a-text-regular-bold">
            {{
              isStringEqualCI(transaction.senderId, userId)
                ? t('chats.sent_label')
                : t('chats.received_label')
            }}
          </div>
          <div
            class="a-chat__amount"
            :class="isCryptoSupported ? 'a-chat__amount--clickable' : ''"
            @click="onClickAmount"
          >
            <v-row align="center" no-gutters>
              <slot name="crypto" />
              <div class="a-chat__rates-column d-flex ml-4">
                <span class="mb-1">{{ currencyFormatter(transaction.amount, crypto) }}</span>
                <span class="a-chat__rates">{{ historyRate }}</span>
              </div>
            </v-row>
          </div>
        </div>

        <div class="a-chat__message-card-body">
          <div class="a-chat__message-text mb-1 a-text-regular-enlarged">
            {{ transaction.message }}
          </div>
        </div>
      </div>
    </div>

    <slot name="actions" />
  </div>
</template>

<script lang="ts">
import { computed, watch, onMounted, defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useTransactionTime } from '@/components/AChat/hooks/useTransactionTime'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { CryptoSymbol } from '@/lib/constants/cryptos'

import { tsIcon, tsUpdatable, tsColor, Cryptos, TransactionStatusType } from '@/lib/constants'
import { isStringEqualCI } from '@/lib/textHelpers'
import currencyAmount from '@/filters/currencyAmount'
import { timestampInSec } from '@/filters/helpers'
import currencyFormatter from '@/filters/currencyAmountWithSymbol'
import { useSwipeLeft } from '@/hooks/useSwipeLeft'
import QuotedMessage from './QuotedMessage.vue'
import { TransactionProvider } from '@/providers/TransactionProvider'

export default defineComponent({
  components: {
    TransactionProvider,
    QuotedMessage
  },
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    dataId: {
      type: String
    },
    /**
     * Highlight the message by applying a background flash effect
     */
    flashing: {
      type: Boolean,
      default: false
    },
    disableMaxWidth: {
      type: Boolean
    },
    elevation: {
      type: Boolean
    },
    swipeDisabled: {
      type: Boolean
    }
  },
  emits: ['click:transaction', 'click:quotedMessage', 'swipe:left', 'longpress'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const store = useStore()

    const userId = computed(() => store.state.address)
    const crypto = computed(() => props.transaction.type as CryptoSymbol | 'UNKNOWN_CRYPTO')

    const time = useTransactionTime(props.transaction)
    const isCryptoSupported = computed(() => props.transaction.type in Cryptos)
    const checkStatusUpdatable = (status: TransactionStatusType) => {
      return tsUpdatable(status, crypto.value as CryptoSymbol)
    }

    const historyRate = computed(() => {
      const amount = currencyAmount(props.transaction.amount, crypto.value)
      return (
        '~' +
        store.getters['rate/historyRate'](
          timestampInSec(crypto.value, props.transaction.timestamp),
          amount,
          crypto.value
        )
      )
    })

    const onClickAmount = () => {
      if (isCryptoSupported.value) {
        emit('click:transaction', props.transaction.id)
      }
    }

    const getHistoryRates = () => {
      store.dispatch('rate/getHistoryRates', {
        timestamp: timestampInSec(crypto.value, props.transaction.timestamp)
      })
    }

    const onLongPress = () => {
      emit('longpress')
    }

    watch(
      () => props.transaction.timestamp,
      () => {
        getHistoryRates()
      }
    )

    onMounted(() => {
      getHistoryRates()
    })

    const { onMove, onSwipeEnd, elementLeftOffset } = useSwipeLeft(() => {
      emit('swipe:left')
    })

    return {
      t,
      crypto,
      userId,

      time,
      isCryptoSupported,
      checkStatusUpdatable,

      isStringEqualCI,
      currencyFormatter,
      tsIcon,
      tsColor,
      tsUpdatable,
      historyRate,
      onClickAmount,
      onLongPress,

      onMove,
      onSwipeEnd,
      elementLeftOffset
    }
  }
})
</script>
