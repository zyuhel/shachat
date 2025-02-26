<template>
  <v-list :class="className">
    <v-list-item @click="sendFunds">
      <template #prepend>
        <v-icon :class="`${className}__icon`" :icon="mdiBankTransferOut" />
      </template>

      <v-list-item-title :class="`${className}__title`">
        {{ $t('home.send_crypto', { crypto }) }}
      </v-list-item-title>
    </v-list-item>

    <template v-if="isADM">
      <v-list-item @click="stakeAndEarn">
        <template #prepend>
          <icon :width="24" :height="24"><stake-icon /></icon>
        </template>

        <v-list-item-title :class="`${className}__title`">
          {{ $t('home.stake_and_earn_btn') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="buyTokens">
        <template #prepend>
          <v-icon :class="`${className}__icon`" :icon="mdiFinance" />
        </template>

        <v-list-item-title :class="`${className}__title`">
          {{ $t('home.buy_tokens_btn') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item v-if="!hasAdmTokens" @click="getFreeTokens">
        <template #prepend>
          <v-icon :class="`${className}__icon`" :icon="mdiGift" />
        </template>

        <v-list-item-title :class="`${className}__title`">
          {{ $t('home.free_adm_btn') }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <buy-tokens-dialog v-model="showBuyTokensDialog" :adamant-address="$store.state.address" />
  </v-list>
</template>

<script>
import { AllCryptos } from '@/lib/constants/cryptos'
import BuyTokensDialog from '@/components/BuyTokensDialog.vue'
import Icon from '@/components/icons/BaseIcon.vue'
import StakeIcon from '@/components/icons/common/Stake.vue'
import { websiteUriToOnion } from '@/lib/uri'

import { mdiBankTransferOut, mdiFinance, mdiGift } from '@mdi/js'


export default {
  components: {
    BuyTokensDialog,
    Icon,
    StakeIcon
  },
  props: {
    crypto: {
      type: String,
      default: AllCryptos.ADM,
      validator: (v) => v in AllCryptos
    },
    isADM: {
      required: true,
      type: Boolean
    }
  },
  setup() {
    return {
      mdiBankTransferOut,
      mdiFinance,
      mdiGift
    }
  },
  data: () => ({
    showBuyTokensDialog: false
  }),
  computed: {
    className: () => 'wallet-actions',
    hasAdmTokens() {
      return this.$store.state.balance > 0
    }
  },
  methods: {
    sendFunds() {
      this.$router.push({
        name: 'SendFunds',
        params: {
          cryptoCurrency: this.crypto
        }
      })
    },
    stakeAndEarn() {
      this.$router.push('/votes')
    },
    buyTokens() {
      this.showBuyTokensDialog = true
    },
    getFreeTokens() {
      const link = websiteUriToOnion(
        this.$t('home.free_tokens_link') + '?wallet=' + this.$store.state.address
      )
      window.open(link, '_blank', 'resizable,scrollbars,status,noopener')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import '@/assets/styles/settings/_colors.scss';

.wallet-actions {
  &__title {
    @include a-text-caption-light();
  }
  :deep(.v-list-item__prepend) {
    > .v-icon {
      margin-inline-end: 16px;
    }
  }
  :deep(.v-list-item) {
    padding: 0 16px;
  }
  :deep(.v-list-item__prepend) {
    > .v-icon {
      opacity: unset;
    }
  }
  :deep(.v-list-item__append) {
    > .v-icon {
      opacity: unset;
    }
  }
}

/** Themes **/
.v-theme--light {
  .wallet-actions {
    &__title,
    &__icon {
      color: map-get($adm-colors, 'regular');
    }
  }
}

.v-theme--dark {
  .wallet-actions {
    &__title,
    &__icon {
      color: map-get($shades, 'white');
    }
  }
}
</style>
