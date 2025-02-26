<template>
  <div :class="classes.root" ref="rootRef" @click="handleClick">
    <div
      :class="classes.message"
      :style="{
        top: position.top,
        left: position.left,
        width: position.width
      }"
    >
      <div
        :class="{
          [classes.reactionSelect]: true,
          [classes.reactionSelectLeft]: transaction.senderId === partnerId,
          [classes.reactionSelectBottom]: isLargeMessage
        }"
      >
        <slot name="top" />
      </div>

      <slot />

      <div
        :class="{
          [classes.menu]: true,
          [classes.menuLeft]: transaction.senderId === partnerId,
          [classes.menuBottom]: isLargeMessage
        }"
      >
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { usePartnerId } from '@/components/AChat/hooks/usePartnerId'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { computed, defineComponent, onMounted, PropType, reactive, ref } from 'vue'

const className = 'a-chat-actions-overlay'
const classes = {
  root: className,
  message: `${className}__message`,
  reactionSelect: `${className}__reaction-select`,
  reactionSelectLeft: `${className}__reaction-select--left`,
  reactionSelectBottom: `${className}__reaction-select--bottom`,
  menu: `${className}__menu`,
  menuLeft: `${className}__menu--left`,
  menuBottom: `${className}__menu--bottom`
}

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const rootRef = ref<HTMLElement | null>(null)
    const partnerId = usePartnerId(props.transaction)

    const rect = computed(() => {
      const element = document.querySelector(`.a-chat__message[data-id='${props.transaction.id}']`)

      if (element) {
        return element.getBoundingClientRect()
      } else {
        console.warn(
          `[AChatActionsOverlay]: <AChatMessage/> with "data-id"="${props.transaction.id}" was not found`
        )
        return null
      }
    })

    const position = reactive({
      top: `${rect.value?.top}px`,
      left: `${rect.value?.left}px`,
      bottom: `${rect.value?.bottom}px`,
      right: `${rect.value?.right}px`,
      width: `${rect.value?.width}px`
    })

    const isLargeMessage = computed(() => {
      if (!rect.value) return false

      return rect.value.height > window.innerHeight / 2
    })

    onMounted(() => {
      setTimeout(() => {
        if (rect.value) {
          const halfOfElementHeight = rect.value ? rect.value.height : 0

          position.top = `calc(50% - ${halfOfElementHeight}px)`
        }
      }, 0)
    })

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation()

      // if clicked outside the <AChatMessage/>
      // close overlay
      if (e.target === rootRef.value) {
        emit('update:modelValue', false)

        return
      }
    }

    return {
      classes,
      position,
      rootRef,
      handleClick,
      partnerId,
      isLargeMessage
    }
  }
})
</script>

<style lang="scss">
.a-chat-actions-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  &__message {
    position: fixed;
    transition: all 0.05s ease;
  }

  &__reaction-select {
    position: absolute;
    bottom: 100%;
    margin-bottom: 16px;
    z-index: 1;

    right: 0;
    left: unset;

    &--left {
      left: 0;
      right: unset;
    }

    &--bottom {
      bottom: unset;
      top: 100%;
    }
  }

  &__menu {
    position: absolute;
    top: 100%;

    right: 0;
    left: unset;

    &--left {
      left: 0;
      right: unset;
    }

    &--bottom {
      margin-top: calc(46px + 16px); // <AReactionSelect/> height + margin
    }
  }
}

.v-theme--light {
  .a-chat-actions-overlay {
  }
}

.v-theme--dark {
  .a-chat-actions-overlay {
  }
}
</style>
