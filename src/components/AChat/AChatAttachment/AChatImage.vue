<template>
  <AChatFileLoader :partner-id="partnerId" :file="img" :transaction="transaction">
    <template #default="{ fileUrl, width, height, error, isLoading, uploadProgress }">
      <v-img v-if="error" :aspect-ratio="width / height" cover>
        <div :class="classes.error">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-icon v-bind="props" :class="classes.errorIcon" :icon="mdiImageOff" />
            </template>

            <span>{{ t('chats.image_loading_error') }}</span>
          </v-tooltip>
        </div>
      </v-img>

      <v-img
        v-else
        :src="fileUrl"
        :aspect-ratio="width / height"
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import { AChatFileLoader } from './AChatFileLoader'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { LocalFile } from '@/lib/files'
import { FileAsset } from '@/lib/adamant-api/asset'
import { mdiImageOff } from '@mdi/js'

const className = 'a-chat-image'
const classes = {
  root: className,
  border: `${className}--border`,
  placeholder: `${className}__placeholder`,
  placeholderTransparent: `${className}__placeholder--transparent`,
  error: `${className}__error`,
  errorIcon: `${className}__error-icon`
}

export default defineComponent({
  props: {
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    },
    img: {
      type: Object as PropType<FileAsset | LocalFile>,
      required: true
    },
    partnerId: {
      type: String,
      required: true
    }
  },
  emits: ['click'],
  components: { AChatFileLoader },
  setup() {
    const { t } = useI18n()

    return {
      t,
      classes,
      mdiImageOff
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';
@import '@/assets/styles/themes/adamant/_mixins.scss';

.a-chat-image {
  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
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

.v-theme--light {
  .a-chat-image {
    &__placeholder {
      background-color: map-get($adm-colors, 'secondary2');

      &--transparent {
        background-color: rgba(map-get($adm-colors, 'grey'), 0.35);
      }
    }

    &__error {
      background-color: map-get($adm-colors, 'secondary2');
    }

    &__error-icon {
      color: map-get($grey, 'darken-1');
    }
  }
}

.v-theme--dark {
  .a-chat-image {
    &__placeholder {
      background-color: map-get($adm-colors, 'muted');

      &--transparent {
        background-color: map-get($adm-colors, 'muted');
      }
    }

    &__error {
      background-color: map-get($adm-colors, 'muted');
    }

    &__error-icon {
      color: map-get($shades, 'white');
    }
  }
}
</style>
