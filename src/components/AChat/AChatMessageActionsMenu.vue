<template>
  <v-list density="compact" variant="text" :class="classes.vList" elevation="9">
    <v-list-item @click="onClickReply">
      <v-list-item-title>{{ t('chats.chat_actions.reply') }}</v-list-item-title>

      <template #append>
        <v-icon :icon="mdiReply" />
      </template>
    </v-list-item>

    <v-divider />

    <v-list-item @click="onClickCopy">
      <v-list-item-title>{{ t('chats.chat_actions.copy') }}</v-list-item-title>

      <template #append>
        <v-icon :icon="mdiContentCopy" />
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiContentCopy, mdiReply } from '@mdi/js'

const className = 'message-actions-menu'
const classes = {
  root: className,
  vList: `${className}__list`,
  vOverlayContent: `${className}__overlay-content`,
  vOverlayContentLeft: `${className}__overlay-content--left`,
  vOverlayContentRight: `${className}__overlay-content--right`
}

export default defineComponent({
  emits: ['update:modelValue', 'click:reply', 'click:copy'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const onClickReply = () => emit('click:reply')
    const onClickCopy = () => emit('click:copy')

    return {
      classes,
      t,
      onClickReply,
      onClickCopy,
      mdiContentCopy,
      mdiReply
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/styles/components/_chat.scss';

$padding-x: 16px;

.message-actions-menu {
  &__list {
    padding-top: 0;
    padding-bottom: 0;
    border-radius: 8px;
  }

  &__overlay-content {
    &--left {
      left: $padding-x !important;
    }

    &--right {
      left: unset !important;
      right: $padding-x + $scroll-bar-width;
    }
  }
}
</style>
