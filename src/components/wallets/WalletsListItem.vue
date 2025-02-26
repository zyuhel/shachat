<template>
  <v-list-item>
    <template v-slot:default>
      <div :class="classes.cryptoContent">
        <v-list-item-title :class="classes.cryptoTitle">{{
          localWallet.cryptoName
        }}</v-list-item-title>
        <v-list-item-subtitle>
          <p :class="classes.cryptoSubtitle">
            {{ localWallet.type }}
            <span :class="classes.cryptoSubtitleBold">{{ localWallet.symbol }}</span>
          </p>
        </v-list-item-subtitle>
      </div>
    </template>
    <template v-slot:prepend>
      <v-avatar>
        <crypto-icon :crypto="localWallet.symbol" :customSize="iconSize" />
      </v-avatar>
    </template>

    <template v-slot:append>
      <WalletBalance :symbol="localWallet.symbol"></WalletBalance>
      <v-checkbox
        class="pa-1"
        density="comfortable"
        hide-details
        :model-value="store.getters['wallets/getVisibility'](localWallet.symbol)"
        @update:model-value="
          store.commit('wallets/updateVisibility', {
            symbol: localWallet.symbol,
            isVisible: $event
          })
        "
      ></v-checkbox>
      <v-btn
        color="grey-lighten-1"
        class="handle"
        density="comfortable"
        :icon="mdiMenu"
        :disabled="!localWallet.isVisible || !!search"
        variant="text"
      ></v-btn>
    </template>
  </v-list-item>
</template>

<script lang="ts">
import CryptoIcon from '@/components/icons/CryptoIcon.vue'
import WalletBalance from '@/components/wallets/WalletBalance.vue'
import { defineComponent, PropType, toRef } from 'vue'
import { useStore } from 'vuex'
import { CryptoSymbol } from '@/lib/constants'
import { mdiMenu } from '@mdi/js'


type Wallet = {
  erc20: boolean
  cryptoName: string
  isVisible: boolean
  symbol: CryptoSymbol
  type: string
}

const className = 'wallets-view'
const classes = {
  root: className,
  cryptoContent: `${className}__crypto-content`,
  cryptoSubtitle: `${className}__crypto-subtitle`,
  cryptoSubtitleBold: `${className}__crypto-subtitle-bold`,
  cryptoTitle: `${className}__crypto-title`
}
const iconSize = 32

export default defineComponent({
  components: {
    WalletBalance,
    CryptoIcon
  },
  props: {
    wallet: {
      type: Object as PropType<Wallet>,
      required: true
    },
    search: {
      type: String,
      required: false,
      default: ''
    }
  },
  setup(props) {
    const store = useStore()
    const localWallet = toRef(props, 'wallet')

    return {
      classes,
      iconSize,
      localWallet,
      store,
      mdiMenu
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.wallets-view {
  &__crypto-content {
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    line-height: 1;
  }
  &__crypto-subtitle {
    font-weight: 300;
    line-height: 1;
  }
  &__crypto-subtitle-bold {
    font-weight: 600;
  }
  &__crypto-title {
    line-height: 1;
  }
  &__info {
    :deep(a) {
      text-decoration-line: none;
      &:hover {
        text-decoration-line: underline;
      }
    }
  }
  :deep(.v-input--selection-controls:not(.v-input--hide-details)) .v-input__slot {
    margin-bottom: 0;
  }

  :deep(.v-checkbox) {
    margin-left: -8px;
  }

  :deep(.sortable-chosen) {
    box-shadow:
      0 8px 9px -5px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
      0 15px 22px 2px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
      0 6px 28px 5px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.12)) !important;
  }
}
/** Themes **/
.v-theme--light {
  .wallets-view {
    &__checkbox {
      :deep(.v-label) {
        color: map-get($adm-colors, 'regular');
      }
      :deep(.v-input--selection-controls__ripple),
      :deep(.v-input--selection-controls__input) i {
        color: map-get($adm-colors, 'regular') !important;
        caret-color: map-get($adm-colors, 'regular') !important;
      }
    }
  }
}
</style>
