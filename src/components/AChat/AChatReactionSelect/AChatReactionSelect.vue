<template>
  <div :class="[classes.root, 'elevation-9']">
    <div :class="classes.predefinedReactions" v-if="!showEmojiPicker">
      <a-chat-reaction-select-item
        v-for="emoji in emojis"
        :key="emoji"
        :emoji="emoji"
        :model-value="lastReaction ? lastReaction.asset.react_message === emoji : false"
        @update:model-value="onReact"
      />

      <v-btn
        icon
        variant="tonal"
        :ripple="false"
        :class="classes.moreButton"
        @click="$emit('click:emojiPicker')"
        :elevation="0"
        :size="32"
      >
        <v-icon :icon="mdiChevronDown" :size="24" />
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { emojiWeight } from '@/lib/chat/emoji-weight/emojiWeight'
import { computed, defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'

import { usePartnerId } from '@/components/AChat/hooks/usePartnerId'
import { isEmptyReaction, NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import AChatReactionSelectItem from './AChatReactionSelectItem.vue'
import { mdiChevronDown } from '@mdi/js'

const className = 'a-chat-reaction-select'
const classes = {
  root: className,
  predefinedReactions: `${className}__predefined-reactions`,
  moreButton: `${className}__more-button`
}

export default defineComponent({
  components: {
    AChatReactionSelectItem
  },
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    showEmojiPicker: {
      type: Boolean
    }
  },
  emits: ['reaction:add', 'reaction:remove', 'click:emojiPicker'],
  setup(props, { emit }) {
    const store = useStore()
    const partnerId = usePartnerId(props.transaction)

    const lastReaction = computed(() =>
      store.getters['chat/lastReaction'](props.transaction.id, partnerId.value, store.state.address)
    )

    const emojis = computed(() => {
      const mostUsedEmojis = new Set<string>()

      if (lastReaction.value && !isEmptyReaction(lastReaction.value)) {
        mostUsedEmojis.add(lastReaction.value.asset.react_message)
      }

      const emojis = emojiWeight.getEmojis()
      emojis.forEach((emoji) => mostUsedEmojis.add(emoji))

      return Array.from(mostUsedEmojis).slice(0, 6)
    })

    const onReact = (state: boolean, emoji: string) => {
      if (!state) {
        // Delete reaction
        emit('reaction:remove', props.transaction.id, emoji)
        return
      }

      emit('reaction:add', props.transaction.id, emoji)
    }

    return {
      classes,
      emojis,
      lastReaction,
      mdiChevronDown,
      onReact
    }
  }
})
</script>

<style lang="scss">
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.a-chat-reaction-select {
  border-radius: 16px;
  cursor: pointer;
  user-select: none;

  &__predefined-reactions {
    display: flex;
    align-items: center;
    padding: 4px;
  }

  &__more-button {
  }
}

.v-theme--light {
  .a-chat-reaction-select {
    background-color: map-get($shades, 'white');
    border: 1px solid map-get($adm-colors, 'secondary2');

    &__more-button {
      color: map-get($shades, 'black');
      background-color: map-get($adm-colors, 'grey-transparent');
    }
  }
}

.v-theme--dark {
  .a-chat-reaction-select {
    background-color: map-get($adm-colors, 'regular');

    &__more-button {
      background-color: map-get($adm-colors, 'secondary2-slightly-transparent');
    }
  }
}
</style>
