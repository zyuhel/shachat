<template>
  <div :class="classes.root">
    <div :class="classes.files">
      <FilesPreviewItem
        v-for="(file, index) in files"
        :key="index"
        :file="file"
        @remove="$emit('remove-item', index)"
      />
    </div>

    <v-btn
      @click="$emit('cancel')"
      :class="classes.closeButton"
      :icon="mdiClose"
      size="24"
      variant="plain"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import type { FileData } from '@/lib/files'
import FilesPreviewItem from './FilesPreviewItem.vue'
import { mdiClose } from '@mdi/js'


const className = 'files-preview'
const classes = {
  root: className,
  files: `${className}__files`,
  closeButton: `${className}__close-button`
}

export default defineComponent({
  components: {
    FilesPreviewItem
  },
  emits: ['cancel', 'remove-item'],
  props: {
    files: {
      type: Array as PropType<Array<FileData>>,
      required: true
    }
  },
  setup() {
    return {
      classes,
      mdiClose
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/settings/_colors.scss';
@import '@/assets/styles/themes/adamant/_mixins.scss';

.files-preview {
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px 16px;
  position: relative;

  &__files {
    display: flex;
    gap: 8px;
    overflow: auto;
    margin-right: 12px;
  }

  &__close-button {
    position: absolute;
    right: 0;
    top: 0;
    margin-right: 4px;
    margin-top: 4px;
  }
}

.v-theme--light {
  .files-preview {
    background-color: map-get($adm-colors, 'secondary');
    color: map-get($adm-colors, 'regular');
    border-left: 3px solid map-get($adm-colors, 'attention');
  }
}

.v-theme--dark {
  .files-preview {
    background-color: map-get($adm-colors, 'secondary2-slightly-transparent2');
    color: #fff;
    border-left: 3px solid map-get($adm-colors, 'attention');
  }
}
</style>
