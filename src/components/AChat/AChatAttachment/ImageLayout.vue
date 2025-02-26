<template>
  <div :class="classes.root">
    <div
      v-for="(group, i) in groups"
      :class="classes.row"
      :key="i"
      :style="{
        'grid-template-columns': `repeat(${group.length}, 1fr)`
      }"
    >
      <AChatImage
        v-for="(img, j) in group"
        @click="handleClick(img)"
        :key="j"
        :img="img"
        :transaction="transaction"
        :partnerId="partnerId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { FileAsset } from '@/lib/adamant-api/asset'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { LocalFile } from '@/lib/files'
import AChatImage from './AChatImage.vue'

function groupImages(images: Array<FileAsset | LocalFile>): Array<Array<FileAsset | LocalFile>> {
  const result: Array<Array<FileAsset | LocalFile>> = []
  const chunk = [...images]

  while (chunk.length > 0) {
    // Determine the chunk size (3 or 2 images per row)
    const chunkSize = chunk.length % 5 === 0 || chunk.length % 5 === 3 ? 3 : 2

    // Splice the correct number of items from the array
    result.push(chunk.splice(0, chunkSize))
  }

  return result
}

const className = 'a-chat-image-layout'
const classes = {
  root: className,
  row: `${className}__row`
}

export default defineComponent({
  components: { AChatImage },
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    images: {
      type: Array as PropType<Array<FileAsset | LocalFile>>,
      required: true
    },
    partnerId: {
      type: String,
      required: true
    }
  },
  emits: ['click:image'],
  setup(props, { emit }) {
    const groups = computed(() => groupImages(props.images))
    const handleClick = (img: FileAsset | LocalFile) => {
      emit('click:image', props.images.indexOf(img))
    }

    return {
      classes,
      groups,
      handleClick
    }
  }
})
</script>

<style lang="scss">
@import 'vuetify/settings';
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import '@/assets/styles/settings/_colors.scss';

$gap-size: 4px;

.a-chat-image-layout {
  max-width: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border-width: $gap-size;
  border-style: solid;

  &__row {
    display: grid;
    max-width: 100%;
    gap: $gap-size;

    & ~ & {
      margin-top: $gap-size;
    }
  }
}

.v-theme--dark {
  .a-chat-image-layout {
    background-color: map-get($adm-colors, 'black');
    border-color: map-get($adm-colors, 'black');
    box-shadow:
      0 1px 10px hsla(0, 0%, 39.2%, 0.06),
      0 1px 1px hsla(0, 0%, 39.2%, 0.04),
      0 2px 10px -1px hsla(0, 0%, 39.2%, 0.02);
  }
}

.v-theme--light {
  .a-chat-image-layout {
    background-color: map-get($shades, 'white');
    border-color: map-get($shades, 'white');
    box-shadow:
      0 1px 10px hsla(0, 0%, 39.2%, 0.06),
      0 1px 1px hsla(0, 0%, 39.2%, 0.04),
      0 2px 10px -1px hsla(0, 0%, 39.2%, 0.02);
  }
}
</style>
