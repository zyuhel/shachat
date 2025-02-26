<template>
  <v-menu
    :min-width="80"
    :max-width="264"
    :close-on-content-click="false"
    :model-value="open"
    @update:model-value="toggleMenu"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        :size="28"
        :ripple="false"
        :elevation="0"
        class="a-chat__message-actions-icon"
        @click="toggleMenu(true)"
      >
        <v-icon :icon="mdiChevronDown" :size="24" />
      </v-btn>
    </template>

    <div>
      <div :class="classes.top">
        <slot name="top" />
      </div>

      <slot name="bottom" />
    </div>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiChevronDown } from '@mdi/js'


import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'

const className = 'message-actions-dropdown'
const classes = {
  root: className,
  top: `${className}__top`
}

export default defineComponent({
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    open: {
      type: Boolean
    }
  },
  emits: ['click:reply', 'click:copy', 'open:change'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const toggleMenu = (state: boolean) => {
      emit('open:change', state, props.transaction)
    }

    return { t, classes, mdiChevronDown, toggleMenu }
  }
})
</script>

<style lang="scss">
.message-actions-dropdown {
  &__top {
    margin-top: 8px;
  }
}
</style>
