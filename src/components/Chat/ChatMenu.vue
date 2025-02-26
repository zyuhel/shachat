<template>
  <div>
    <v-menu eager>
      <template #activator="{ props }">
        <v-icon class="chat-menu__icon" v-bind="props" :icon="mdiPlusCircleOutline" size="28" />
      </template>
      <UploadFile
        :partnerId="partnerId"
        :accept="acceptImage"
        @file="handleFileSelected"
        ref="UploadImageRef"
      />
      <UploadFile :partnerId="partnerId" @file="handleFileSelected" ref="UploadFileRef" />
      <v-list class="chat-menu__list">
        <!-- Attach Image -->
        <v-list-item @click="$refs.UploadImageRef.$refs.fileInput.click()">
          <template #prepend>
            <icon-box>
              <v-icon :icon="mdiImage" />
            </icon-box>
          </template>
          <v-list-item-title>{{ $t('chats.attach_image') }}</v-list-item-title>
        </v-list-item>

        <!-- Attach File -->
        <v-list-item @click="$refs.UploadFileRef.$refs.fileInput.click()">
          <template #prepend>
            <icon-box>
              <v-icon :icon="mdiFile" />
            </icon-box>
          </template>
          <v-list-item-title>{{ $t('chats.attach_file') }}</v-list-item-title>
        </v-list-item>

        <!-- Cryptos -->
        <v-list-item v-for="c in wallets" :key="c" @click="sendFunds(c)">
          <template #prepend>
            <crypto-icon :crypto="c" box-centered />
          </template>

          <v-list-item-title>{{ $t('chats.send_crypto', { crypto: c }) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <ChatDialog v-model="dialog" :title="dialogTitle" :text="dialogText" />
  </div>
</template>

<script>
import { Cryptos } from '@/lib/constants'
import ChatDialog from '@/components/Chat/ChatDialog.vue'
import CryptoIcon from '@/components/icons/CryptoIcon.vue'
import IconBox from '@/components/icons/IconBox.vue'
import UploadFile from '../UploadFile.vue'
import { mdiFile, mdiImage, mdiPlusCircleOutline } from '@mdi/js'


export default {
  components: {
    IconBox,
    ChatDialog,
    CryptoIcon,
    UploadFile
  },
  emits: ['files'],
  props: {
    partnerId: {
      type: String,
      default: ''
    },
    replyToId: {
      type: String
    }
  },
  setup() {
    return {
      mdiFile,
      mdiImage,
      mdiPlusCircleOutline
    }
  },
  data: () => ({
    dialog: false,
    dialogTitle: '',
    dialogText: '',
    crypto: '',
    filesList: [],
    acceptImage: 'image/* , video/*',
    acceptFile: 'application/* ,text/*, audio/*'
  }),
  computed: {
    orderedVisibleWalletSymbols() {
      return this.$store.getters['wallets/getVisibleOrderedWalletSymbols']
    },
    wallets() {
      return this.orderedVisibleWalletSymbols.map((crypto) => {
        return crypto.symbol
      })
    }
  },
  methods: {
    handleFileSelected(imageData) {
      this.$emit('files', [imageData])
    },
    sendFunds(crypto) {
      // check if user has crypto wallet
      // otherwise show dialog
      this.fetchCryptoAddress(crypto)
        .then(() => {
          this.$router.push({
            name: 'SendFunds',
            params: {
              cryptoCurrency: crypto,
              recipientAddress: this.partnerId
            },
            query: {
              from: `/chats/${this.partnerId}`,
              replyToId: this.replyToId
            }
          })
        })
        .catch((e) => {
          this.crypto = crypto
          if (e.toString().includes('Only legacy Lisk address')) {
            this.dialogTitle = this.$t('transfer.legacy_address_title', { crypto })
            this.dialogText = this.$t('transfer.legacy_address_text', { crypto })
          }
          if (e.toString().includes('No crypto wallet address')) {
            this.dialogTitle = this.$t('transfer.no_address_title', { crypto })
            this.dialogText = this.$t('transfer.no_address_text', { crypto })
          }
          this.dialog = true
        })
    },
    fetchCryptoAddress(crypto) {
      if (crypto === Cryptos.ADM) {
        return Promise.resolve()
      }

      return this.$store
        .dispatch('partners/fetchAddress', {
          crypto,
          partner: this.partnerId,
          moreInfo: true
        })
        .then((address) => {
          if (!address) {
            throw new Error('No crypto wallet address')
          } else if (address.onlyLegacyLiskAddress) {
            throw new Error('Only legacy Lisk address')
          }

          return address
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
.chat-menu {
  &__list {
    min-width: 200px;
    max-height: 100vh;

    :deep(.v-list-item-title) {
      font-weight: 400;
    }
  }
}

/** Themes **/
.v-theme--light {
  .chat-menu {
    &__icon {
      color: map-get($grey, 'darken-1');
    }
  }
}
.v-theme--dark {
  .chat-menu {
    &__icon {
      color: map-get($shades, 'white');
    }
    &__list {
      :deep(.v-list-item-title) {
        color: map-get($shades, 'white');
      }
    }
  }
}
</style>
