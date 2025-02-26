import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { formatMarkdown } from '@/filters/formatMarkdown'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { usePartnerId } from '@/components/AChat/hooks/usePartnerId'

export function useFormatMessage(transaction: NormalizedChatMessageTransaction) {
  const store = useStore()
  const { t } = useI18n()

  const partnerId = usePartnerId(transaction)
  const formatMessagesOptionEnabled = computed(() => store.state.options.formatMessages)
  const formattedMessage = computed(() =>
    formatMarkdown(transaction, partnerId.value, formatMessagesOptionEnabled.value, t)
  )

  return formattedMessage
}
