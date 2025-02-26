<template>
  <div
    class="px-0"
    :class="{
      [classes.root]: true,
      'justify-center': balance === 0
    }"
  >
    <p
      :class="{ [classes.statusTitle]: true, 'a-text-explanation': balance === 0 }"
      class="text-end"
    >
      {{ xs ? calculatedBalance : calculatedFullBalance }}
      <v-tooltip
        v-if="xs && calculatedFullBalance.toString().length > SIGNIFICANT_DIGITS"
        activator="parent"
        location="top"
      >
        {{ calculatedFullBalance }}
      </v-tooltip>
    </p>

    <p v-if="Number(balance) !== 0" :class="classes.statusText" class="text-end">
      {{ currentFiatCurrency }} {{ rate }}
    </p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import currencyAmount from '@/filters/currencyAmount'
import { Cryptos } from '@/lib/constants'
import { useStore } from 'vuex'
import smartNumber from '@/lib/smartNumber'
import { useDisplay } from 'vuetify'

const SIGNIFICANT_DIGITS = 7
const className = 'wallet-balance'

const classes = {
  root: className,
  statusTitle: `${className}__status-title`,
  statusText: `${className}__status-text`
}

export default defineComponent({
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const { xs } = useDisplay()
    const { symbol } = toRefs(props)
    const key = symbol.value.toLowerCase()

    const balance = computed(() => {
      return symbol.value === Cryptos.ADM
        ? store.state.balance
        : store.state[key]
          ? store.state[key].balance
          : 0
    })

    const calculatedBalance = computed(() => {
      return smartNumber(calculatedFullBalance.value)
    })

    const calculatedFullBalance = computed(() => {
      return balance.value ? currencyAmount(Number(balance.value), symbol.value, true) : 0
    })

    const currentFiatCurrency = computed(() => {
      return store.state.options.currentRate
    })

    const currentRate = computed(() => {
      return store.state.rate.rates[`${symbol.value}/${currentFiatCurrency.value}`]
    })

    const rate = computed(() => {
      return currentRate.value !== undefined
        ? Number((balance.value * currentRate.value).toFixed(2))
        : 0
    })

    return {
      SIGNIFICANT_DIGITS,
      balance,
      classes,
      calculatedBalance,
      calculatedFullBalance,
      currentFiatCurrency,
      rate,
      xs
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.wallet-balance {
  height: 40px;
  display: flex;
  line-height: 1;
  flex-direction: column;
  justify-content: space-between;

  &__status-title {
    line-height: 1;
  }

  &__status-text {
    font-size: 12px;
    font-weight: 300;
    line-height: 1;
  }
}

.v-theme--light {
  .wallet-balance {
    &__status-text {
      color: map-get($adm-colors, 'regular');
    }
  }
}

.v-theme--dark {
  .wallet-balance {
    &__status-text {
      color: map-get($shades, 'white');
      opacity: 0.7;
    }
  }
}
</style>
