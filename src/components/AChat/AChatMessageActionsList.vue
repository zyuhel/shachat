<template>
  <v-list density="compact" variant="text" elevation="9" :class="classes.root">
    <v-list-item @click="emit('click:reply')">
      <v-list-item-title>{{ t('chats.chat_actions.reply') }}</v-list-item-title>

      <template #append>
        <v-icon :icon="mdiReply" />
      </template>
    </v-list-item>

    <v-divider />

    <v-list-item @click="emit('click:copy')">
      <v-list-item-title>{{ t('chats.chat_actions.copy') }}</v-list-item-title>

      <template #append>
        <v-icon :icon="mdiContentCopy" />
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiContentCopy,  mdiReply } from '@mdi/js'


const className = 'message-actions-list'
const classes = {
  root: className
}

export default defineComponent({
  emits: ['click:reply', 'click:copy'],
  setup(props, { emit }) {
    const { t } = useI18n()

    return {
      classes,
      t,
      emit,
      mdiContentCopy,
      mdiReply
    }
  }
})
</script>

<style lang="scss">
.message-actions-list {
  padding-top: 0;
  padding-bottom: 0;
  border-radius: 8px;
  margin-top: 16px;
}
</style>
