<template>
  <v-dialog v-model="show" eager width="320" :class="classes.root">
    <v-card>
      <v-card-title :class="classes.dialogTitle" class="a-text-header">
        {{ t('home.share_uri', { crypto }) }}
      </v-card-title>
      <v-divider class="a-divider" />
      <v-card-text class="pa-0">
        <v-list>
          <v-list-item @click="copyAddress">
            <v-list-item-title :class="classes.listItemTitle">
              {{ t('home.copy_address') }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isADM" @click="copyURI">
            <v-list-item-title :class="classes.listItemTitle">
              {{ t('home.copy_uri') }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="openQRCodeRenderer">
            <v-list-item-title :class="classes.listItemTitle">
              {{ t('home.show_qr_code') }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="openInExplorer">
            <v-list-item-title :class="classes.listItemTitle">
              {{ t('home.explorer') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <QrcodeRendererDialog v-model="showQrcodeRendererDialog" :logo="isADM" :text="uri" />
  </v-dialog>
</template>

<script lang="ts">
import { ref, computed, defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import { CryptoSymbol, Cryptos, isErc20 } from '@/lib/constants'

import QrcodeRendererDialog from '@/components/QrcodeRendererDialog.vue'
import copyToClipboard from 'copy-to-clipboard'
import { generateURI } from '@/lib/uri'
import { getExplorerAddressUrl } from '@/config/utils'

const className = 'share-uri-dialog'
const classes = {
  root: className,
  dialogTitle: `${className}__dialog-title`,
  listItemTitle: `${className}__list-item-title`
}

export default defineComponent({
  components: {
    QrcodeRendererDialog
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    crypto: {
      type: String as PropType<CryptoSymbol>,
      required: true
    },
    isADM: {
      type: Boolean
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const store = useStore()
    const showQrcodeRendererDialog = ref(false)

    const show = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    const uri = computed(() => generateURI(props.crypto, props.address, ''))
    const isErc = computed(() => isErc20(props.crypto))

    const copyAddress = () => {
      copyToClipboard(props.address)
      store.dispatch('snackbar/show', { message: t('home.copied') })
      show.value = false
    }

    const copyURI = () => {
      copyToClipboard(uri.value)
      store.dispatch('snackbar/show', { message: t('home.copied') })
      show.value = false
    }

    const openQRCodeRenderer = () => {
      showQrcodeRendererDialog.value = true
      show.value = false
    }

    const openInExplorer = () => {
      const crypto = isErc.value ? Cryptos.ETH : props.crypto
      const explorerLink = getExplorerAddressUrl(crypto, props.address)
      window.open(explorerLink, '_blank', 'resizable,scrollbars,status,noopener')
    }

    return {
      classes,
      t,
      showQrcodeRendererDialog,
      show,
      uri,
      isErc,
      copyAddress,
      copyURI,
      openQRCodeRenderer,
      openInExplorer
    }
  }
})
</script>

<style lang="scss">
@import 'vuetify/_settings.scss';

.share-uri-dialog {
}

.v-theme--dark {
  .share-uri-dialog {
    &__dialog-title {
      color: map-get($shades, 'white');
    }

    &__list-item-title {
      color: map-get($shades, 'white');
    }
  }
}
</style>
