<template>
  <div :class="classes.root">
    <app-toolbar-centered app :title="t('options.wallets_list')" :show-back="true" flat fixed />

    <v-container fluid class="px-0 container--with-app-toolbar">
      <v-row justify="center" no-gutters>
        <container>
          <WalletsSearchInput @change="searchChanged"></WalletsSearchInput>
          <div
            class="v-list v-list--density-default v-list--one-line"
            :class="[isDarkTheme ? 'v-theme--dark' : 'v-theme--light']"
          >
            <draggable
              class="list-group"
              v-model="filteredWallets"
              v-bind="dragOptions"
              handle=".handle"
              @start="isDragging = true"
              @end="isDragging = false"
              item-key="cryptoName"
            >
              <template #item="{ element }">
                <WalletsListItem :wallet="element" :search="search"></WalletsListItem>
              </template>
            </draggable>
            <v-list-item
              v-if="!filteredWallets.length"
              :title="t('wallets.coins_not_found_title')"
              class="text-center"
            ></v-list-item>
          </div>
          <v-row
            v-if="filteredWallets.length"
            :class="`${classes.root}__review`"
            align="center"
            justify="space-between"
            no-gutters
          >
            <v-spacer></v-spacer>
            <WalletResetDialog></WalletResetDialog>
          </v-row>
        </container>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import AppToolbarCentered from '@/components/AppToolbarCentered.vue'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { CryptosInfo, CryptoSymbol, isErc20 } from '@/lib/constants'
import { useStore } from 'vuex'
import WalletsSearchInput from '@/components/wallets/WalletsSearchInput.vue'
import WalletsListItem from '@/components/wallets/WalletsListItem.vue'
import WalletResetDialog from '@/components/wallets/WalletResetDialog.vue'
import { CoinSymbol } from '@/store/modules/wallets/types'
import { useTheme } from '@/hooks/useTheme'
import { useTimeoutPoll } from '@vueuse/core'

const BALANCE_UPDATE_INTERVAL_MS = 30000

const className = 'wallets-view'
const classes = {
  root: className
}

const dragOptions = {
  animation: 200,
  disabled: false,
  ghostClass: 'ghost',
  group: 'description'
}

type Wallet = {
  erc20?: boolean
  balance?: number
  cryptoName?: string
  currentRate?: number
  isVisible: boolean
  key?: string
  rate?: number
  symbol: CryptoSymbol
  type?: string
}

export default defineComponent({
  components: {
    WalletResetDialog,
    WalletsListItem,
    WalletsSearchInput,
    AppToolbarCentered,
    draggable
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const { isDarkTheme } = useTheme()

    const isDragging = ref(false)
    const search = ref('')

    const orderedAllWalletSymbols = computed<CoinSymbol[]>(() => {
      return store.getters['wallets/getAllOrderedWalletSymbols']
    })

    const wallets = computed(() => {
      return orderedAllWalletSymbols.value.map((crypto: CoinSymbol) => {
        const symbol = crypto.symbol
        const cryptoName = CryptosInfo[symbol].nameShort || CryptosInfo[symbol].name
        const erc20 = isErc20(symbol)
        const isVisible = crypto.isVisible
        const type = CryptosInfo[symbol].type ?? 'Blockchain'

        return {
          cryptoName,
          erc20,
          isVisible,
          symbol,
          type
        }
      })
    })

    const searchChanged = (value: string | Event) => {
      if (value instanceof Event) return
      search.value = value
    }

    const lowerCasedSearch = computed(() => {
      return search.value.toLowerCase()
    })

    const filteredWallets = computed({
      get() {
        return wallets.value.filter((wallet: Wallet) => {
          return (
            wallet.cryptoName?.toLowerCase().includes(lowerCasedSearch.value) ||
            wallet.symbol.toLowerCase().includes(lowerCasedSearch.value)
          )
        })
      },
      set(value) {
        const mappedValue = value.map((item: Wallet) => {
          return {
            symbol: item.symbol,
            isVisible: item.isVisible
          }
        })

        store.dispatch('wallets/setWalletSymbols', mappedValue)
      }
    })
    const { resume, pause } = useTimeoutPoll(async () => {
      await store.dispatch('updateBalance', {
        requestedByUser: true
      })
    }, BALANCE_UPDATE_INTERVAL_MS)

    onMounted(() => {
      resume()
    })

    onBeforeUnmount(() => {
      pause()
    })

    return {
      classes,
      t,
      dragOptions,
      filteredWallets,
      isDarkTheme,
      isDragging,
      search,
      searchChanged,
      toolbar,
      wallets
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.wallets-view {
  &__review {
    padding-top: 15px !important;
    padding-bottom: 15px !important;
  }
}

.v-theme--dark {
  .v-list {
    background-color: map-get($adm-colors, 'black2');
  }
}
</style>
