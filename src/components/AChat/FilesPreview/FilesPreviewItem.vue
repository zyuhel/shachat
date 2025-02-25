<template>
  <div :class="classes.root">
    <div :class="classes.preview">
      <img v-if="file.isImage" :class="classes.img" :alt="file.name" :src="file.content" />
      <IconFile :class="classes.icon" :text="extension" :height="80" :width="80" v-else />

      <v-icon size="18" :icon="mdiClose" @click="$emit('remove')" :class="classes.removeIcon" />
    </div>

    <p :class="classes.fileName">{{ file.name }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

import { MAX_FILE_EXTENSION_DISPLAY_LENGTH } from '@/lib/constants'
import { extractFileExtension, FileData } from '@/lib/files'
import IconFile from '@/components/icons/common/IconFile.vue'
import { mdiClose } from '@mdi/js'

const className = 'preview-file'
const classes = {
  root: className,
  preview: `${className}__preview`,
  img: `${className}__img`,
  icon: `${className}__icon`,
  removeIcon: `${className}__remove-icon`,
  fileName: `${className}__file-name`
}

export default defineComponent({
  components: {
    IconFile
  },
  emits: ['remove'],
  props: {
    file: {
      type: Object as PropType<FileData>,
      required: true
    }
  },
  setup(props) {
    const extension = computed(() => {
      const fileExtension = extractFileExtension(props.file.name)

      if (fileExtension && fileExtension.length <= MAX_FILE_EXTENSION_DISPLAY_LENGTH) {
        return fileExtension.toUpperCase()
      }

      return 'File'
    })

    return {
      classes,
      extension,
      mdiClose
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/settings/_colors.scss';
@import '@/assets/styles/themes/adamant/_mixins.scss';

.preview-file {
  width: 80px;

  &__preview {
    width: 80px;
    height: 80px;
    position: relative;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__file-name {
    font-size: 14px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__remove-icon {
    position: absolute;
    top: 2px;
    right: 2px;
    border-radius: 50%;
  }
}

.v-theme--light {
  .preview-file {
    &__remove-icon {
      background-color: map-get($adm-colors, 'regular');
      color: white;
    }
  }
}

.v-theme--dark {
  .preview-file {
    &__remove-icon {
      background-color: map-get($adm-colors, 'regular');
      color: white;
    }
  }
}
</style>
