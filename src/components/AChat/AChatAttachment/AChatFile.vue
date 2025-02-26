<template>
  <div :class="classes.root">
    <AChatFileLoader v-if="isImage" :transaction="transaction" :partnerId="partnerId" :file="file">
      <template #default="{ fileUrl, error, isLoading, uploadProgress }">
        <div v-if="error" :style="{ width: `${iconSize}px`, height: `${iconSize}px` }">
          <div :class="classes.error">
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-icon v-bind="props" :class="classes.errorIcon" :icon="mdiImageOff" />
              </template>

              <span>{{ t('chats.file_loading_error') }}</span>
            </v-tooltip>
          </div>
        </div>

        <v-img
          v-else
          :src="fileUrl"
          :width="iconSize"
          :height="iconSize"
          :max-width="iconSize"
          :max-height="iconSize"
          cover
          @click="!isLoading && $emit('click')"
        >
          <v-fade-transition>
            <div
              v-show="uploadProgress < 100"
              :class="[classes.placeholder, classes.placeholderTransparent]"
            >
              <v-progress-circular color="grey-lighten-4" :model-value="uploadProgress" />
            </div>
          </v-fade-transition>

          <template #placeholder>
            <div :class="classes.placeholder">
              <v-progress-circular color="grey-lighten-4" indeterminate />
            </div>
          </template>
        </v-img>
      </template>
    </AChatFileLoader>

    <IconFile
      v-else
      :class="classes.icon"
      :text="fileExtension?.toUpperCase()"
      :height="iconSize"
      :width="iconSize"
      @click="$emit('click')"
    />

    <div :class="classes.fileInfo">
      <div :class="classes.name">{{ fileName }}</div>
      <div :class="classes.size">{{ formatBytes(fileSize) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { LocalFile, isLocalFile, formatBytes } from '@/lib/files'
import { FileAsset } from '@/lib/adamant-api/asset'
import IconFile from '@/components/icons/common/IconFile.vue'
import { AChatFileLoader } from './AChatFileLoader'
import { mdiImageOff } from '@mdi/js'

const className = 'a-chat-file'
const classes = {
  root: className,
  placeholder: `${className}__placeholder`,
  placeholderTransparent: `${className}__placeholder--transparent`,
  icon: `${className}__icon`,
  iconWrapper: `${className}__icon-wrapper`,
  fileInfo: `${className}__file-info`,
  name: `${className}__name`,
  size: `${className}__size`,
  error: `${className}__error`,
  errorIcon: `${className}__error-icon`
}

const iconSize = 64

export default defineComponent({
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    file: {
      type: Object as PropType<FileAsset | LocalFile>,
      required: true
    },
    partnerId: {
      type: String,
      required: true
    }
  },
  emits: ['click'],
  components: { AChatFileLoader, IconFile },
  setup(props) {
    const { t } = useI18n()

    const isImage = computed(() => {
      if (isLocalFile(props.file)) {
        return props.file.file.isImage
      }

      return ['jpg', 'jpeg', 'png'].includes(props.file.extension!)
    })
    const fileName = computed(() =>
      isLocalFile(props.file) ? props.file.file.name : props.file.name || 'UNNAMED'
    )
    const fileExtension = computed(() =>
      isLocalFile(props.file) ? props.file.file.type : props.file.extension
    )
    const fileSize = computed(() => {
      return isLocalFile(props.file) ? props.file.file.encoded.binary.length : props.file.size
    })

    return {
      t,
      classes,
      isImage,
      fileName,
      fileExtension,
      fileSize,
      mdiImageOff,
      formatBytes,
      iconSize
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';
@import '@/assets/styles/themes/adamant/_mixins.scss';

.a-chat-file {
  display: flex;
  margin-left: auto;
  width: 160px;

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__file-info {
    margin-left: 8px;
    overflow: hidden;
  }

  &__name {
    font-size: 16px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__size {
    font-size: 14px;
  }

  &__error {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    font-weight: 400;
  }
}

.v-theme--dark {
  .a-chat-file {
    &__placeholder {
      background-color: map-get($adm-colors, 'muted');

      &--transparent {
        background-color: map-get($adm-colors, 'muted');
      }
    }

    &__name {
      color: map-get($shades, 'white');
    }

    &__size {
      color: map-get($adm-colors, 'grey');
    }

    &__error {
      background-color: map-get($adm-colors, 'secondary2-slightly-transparent');
    }

    &__error-icon {
      color: map-get($shades, 'white');
    }
  }
}

.v-theme--light {
  .a-chat-file {
    &__placeholder {
      background-color: map-get($adm-colors, 'secondary2');

      &--transparent {
        background-color: rgba(map-get($adm-colors, 'grey'), 0.35);
      }
    }

    &__name {
      color: map-get($adm-colors, 'regular');
    }

    &__size {
      color: map-get($adm-colors, 'muted');
    }

    &__error {
      background-color: map-get($adm-colors, 'secondary2');
    }

    &__error-icon {
      color: map-get($grey, 'darken-1');
    }
  }
}
</style>
