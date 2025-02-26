<template>
  <div :class="classes.root">
    <AChatFile
      v-for="(file, index) in files"
      :key="index"
      :file="file"
      :partnerId="partnerId"
      :transaction="transaction"
      @click="handleClick(file)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { FileAsset } from '@/lib/adamant-api/asset'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { LocalFile } from '@/lib/files'
import AChatFile from './AChatFile.vue'

const className = 'a-chat-inline-layout'
const classes = {
  root: className
}

export default defineComponent({
  components: { AChatFile },
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    files: {
      type: Array as PropType<Array<FileAsset | LocalFile>>,
      required: true
    },
    partnerId: {
      type: String,
      required: true
    }
  },
  emits: ['click:file'],
  setup(props, { emit }) {
    const handleClick = (img: FileAsset | LocalFile) => {
      emit('click:file', props.files.indexOf(img))
    }

    return {
      classes,
      handleClick
    }
  }
})
</script>

<style lang="scss">
@import 'vuetify/settings';
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import '@/assets/styles/settings/_colors.scss';

.a-chat-inline-layout {
  display: grid;
  gap: 8px;
  border-style: solid;
  border-width: 8px;
  border-radius: 8px;
}

.v-theme--dark {
  .a-chat-inline-layout {
    background-color: map-get($adm-colors, 'black');
    border-color: map-get($adm-colors, 'black');
    box-shadow:
      0 1px 10px hsla(0, 0%, 39.2%, 0.06),
      0 1px 1px hsla(0, 0%, 39.2%, 0.04),
      0 2px 10px -1px hsla(0, 0%, 39.2%, 0.02);
  }
}

.v-theme--light {
  .a-chat-inline-layout {
    background-color: map-get($shades, 'white');
    border-color: map-get($shades, 'white');
    box-shadow:
      0 1px 10px hsla(0, 0%, 39.2%, 0.06),
      0 1px 1px hsla(0, 0%, 39.2%, 0.04),
      0 2px 10px -1px hsla(0, 0%, 39.2%, 0.02);
  }
}
</style>
