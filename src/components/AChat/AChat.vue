<template>
  <div :class="classes.root">
    <div :class="classes.content">
      <slot name="header" />

      <v-divider />

      <div :class="classes.body">
        <div class="text-center py-2">
          <v-progress-circular
            v-show="loading"
            indeterminate
            color="primary"
            size="24"
            style="z-index: 100"
          />
        </div>

        <div ref="messagesRef" :class="classes.bodyMessages">
          <template v-for="message in messages" :key="message.id">
            <slot
              name="message"
              :message="message"
              :sender="getSenderMeta(message.senderId)"
              :user-id="userId"
              :locale="locale"
            />
          </template>
        </div>

        <div :class="classes.fab">
          <slot name="fab" />
        </div>
      </div>

      <slot name="form" />
    </div>

    <div v-if="$slots.overlay" :class="classes.overlay">
      <slot name="overlay" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, defineComponent, PropType } from 'vue'
import throttle from 'lodash/throttle'
import scrollIntoView from 'scroll-into-view-if-needed'
import Styler from 'stylefire'
import { animate } from 'popmotion'
import { SCROLL_TO_REPLIED_MESSAGE_ANIMATION_DURATION } from '@/lib/constants'
import { isStringEqualCI } from '@/lib/textHelpers'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { User } from '@/components/AChat/types'

const className = 'a-chat'
const classes = {
  root: className,
  content: `${className}__content`,
  body: `${className}__body`,
  bodyMessages: `${className}__body-messages`,
  fab: `${className}__fab`,
  overlay: `${className}__overlay`
}

export default defineComponent({
  props: {
    messages: {
      type: Array as PropType<NormalizedChatMessageTransaction[]>,
      default: () => []
    },
    partners: {
      type: Array as PropType<User[]>,
      default: () => []
    },
    userId: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    locale: {
      type: String,
      default: 'en'
    }
  },
  emits: ['scroll', 'scroll:bottom', 'scroll:top'],
  setup(props, { emit }) {
    const messagesRef = ref<HTMLDivElement | null>(null)
    const currentScrollHeight = ref(0)
    const currentScrollTop = ref(0)
    const currentClientHeight = ref(0)

    const resizeHandler = () => {
      if (!messagesRef.value) return

      const clientHeightDelta = currentClientHeight.value - messagesRef.value.clientHeight

      const nonVisibleClientHeight =
        messagesRef.value.scrollHeight -
        messagesRef.value.clientHeight -
        Math.ceil(messagesRef.value.scrollTop)
      const scrolledToBottom = nonVisibleClientHeight === 0

      if (!scrolledToBottom) {
        messagesRef.value.scrollTop += clientHeightDelta
      }

      currentClientHeight.value = messagesRef.value.clientHeight
    }

    const resizeObserver = ref(new ResizeObserver(resizeHandler))

    const emitScroll = throttle(
      () => emit('scroll', currentScrollTop.value, isScrolledToBottom()),
      200
    )

    const attachScrollListener = () => {
      messagesRef.value?.addEventListener('scroll', onScroll)
    }

    const destroyScrollListener = () => {
      messagesRef.value?.removeEventListener('scroll', onScroll)
    }

    const onScroll = () => {
      if (!messagesRef.value) return

      const scrollHeight = messagesRef.value.scrollHeight
      const scrollTop = Math.ceil(messagesRef.value.scrollTop)
      const clientHeight = messagesRef.value.clientHeight

      if (scrollHeight - scrollTop === clientHeight) {
        emit('scroll:bottom')
      } else if (scrollTop === 0) {
        currentScrollHeight.value = scrollHeight
        emit('scroll:top')
      }

      currentScrollTop.value = scrollTop
      currentScrollHeight.value = scrollHeight

      emitScroll()
    }

    const maintainScrollPosition = () => {
      if (!messagesRef.value) return

      messagesRef.value.scrollTop =
        messagesRef.value.scrollHeight - currentScrollHeight.value + currentScrollTop.value
    }

    const scrollToBottom = () => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    }

    const scrollTo = (position: number) => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = position
      }
    }

    const scrollToMessage = (index: number) => {
      if (!messagesRef.value) return

      const elements = messagesRef.value.children

      if (!elements) return

      const element = elements[elements.length - 1 - index] as HTMLElement

      if (element) {
        messagesRef.value.scrollTop = element.offsetTop - 16
      } else {
        scrollToBottom()
      }
    }

    const scrollToMessageEasy = async (index: number): Promise<boolean> => {
      if (!messagesRef.value) return false

      const elements = messagesRef.value.children

      if (!elements) return false

      const element = elements[elements.length - 1 - index] as HTMLElement

      if (!element) return false

      return new Promise((resolve) => {
        scrollIntoView(element, {
          behavior: (instructions) => {
            const [{ el, top }] = instructions
            const styler = Styler(el)

            if (el.scrollTop === top) {
              resolve(false)
              return
            }

            animate({
              from: el.scrollTop,
              to: top,
              duration: SCROLL_TO_REPLIED_MESSAGE_ANIMATION_DURATION,
              onUpdate: (top) => styler.set('scrollTop', top),
              onComplete: () => resolve(true)
            })
          },
          block: 'center'
        })
      })
    }

    const isScrolledToBottom = () => {
      if (!messagesRef.value) return false

      const scrollOffset =
        messagesRef.value.scrollHeight -
        Math.ceil(messagesRef.value.scrollTop) -
        messagesRef.value.clientHeight

      return scrollOffset <= 60
    }

    const getSenderMeta = (senderId: string) => {
      return props.partners.find((partner) => isStringEqualCI(partner.id, senderId))
    }

    onMounted(() => {
      attachScrollListener()

      if (messagesRef.value) {
        currentClientHeight.value = messagesRef.value.clientHeight
        resizeObserver.value.observe(messagesRef.value)
      }
    })

    onBeforeUnmount(() => {
      destroyScrollListener()
      if (messagesRef.value) {
        resizeObserver.value?.unobserve(messagesRef.value)
      }
    })

    return {
      classes,
      messagesRef,
      maintainScrollPosition,
      scrollToBottom,
      scrollTo,
      scrollToMessage,
      scrollToMessageEasy,
      getSenderMeta,
      isScrolledToBottom
    }
  }
})
</script>
