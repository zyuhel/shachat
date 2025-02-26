<template>
  <v-bottom-navigation
    v-model="currentPageIndex"
    app
    height="50"
    class="app-navigation"
    :elevation="0"
  >
    <!-- Wallet -->
    <v-btn v-if="walletShouldBeVisible" to="/home">
      <v-icon :icon="mdiWallet" />
      <span>{{ $t('bottom.wallet_button') }}</span>
    </v-btn>

    <!-- Chat -->
    <v-btn to="/chats">
      <v-badge
        v-if="numOfNewMessages > 0"
        :value="numOfNewMessages"
        overlap
        color="primary"
        :content="numOfNewMessages > 99 ? '99+' : numOfNewMessages"
      >
        <v-icon :icon="mdiForum" />
      </v-badge>
      <v-icon v-else :icon="mdiForum" />

      <span>{{ $t('bottom.chats_button') }}</span>
    </v-btn>

    <!-- Settings -->
    <v-btn to="/options">
      <v-icon :icon="mdiCog" />
      <span>{{ $t('bottom.settings_button') }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>
<script>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { watch, onMounted, defineComponent, ref, computed } from 'vue'
import { mdiWallet, mdiForum, mdiCog } from '@mdi/js'


export default defineComponent({
  setup() {
    const pages = [
      {
        title: 'wallet',
        link: '/home',
      },
      {
        title: 'chats',
        link: '/chats',
      },
      {
        title: 'settings',
        link: '/options',
      }
    ]
    const currentPageIndex = ref(0)
    const store = useStore()
    const route = useRoute()
    const getCurrentPageIndex = () => {
      const currentPage = pages.find((page) => {
        const pattern = new RegExp(`^${page.link}`)

        return route.path.match(pattern)
      })

      return pages.indexOf(currentPage)
    }
    const numOfNewMessages = computed(() => store.getters['chat/totalNumOfNewMessages'])

    const walletShouldBeVisible = computed(() => {
      return !!store.getters['wallets/getVisibleSymbolsCount']
    })

    watch(route, () => {
      currentPageIndex.value = getCurrentPageIndex()
    })
    onMounted(() => {
      currentPageIndex.value = getCurrentPageIndex()
    })

    return {
      currentPageIndex,
      numOfNewMessages,
      walletShouldBeVisible,
      mdiWallet,
      mdiForum,
      mdiCog,
      getCurrentPageIndex,
    }
  }
})
</script>
<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

/**
 * 1. Navigation Button.
 *    a. Active
 *    b. Inactive
 */
.app-navigation {
  &.v-bottom-navigation {
    transform: unset !important;
    overflow: visible;
  }
  &.v-bottom-navigation .v-btn {
    font-weight: 300;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
  }
  :deep(.v-btn.v-btn--active) {
    font-size: unset;

    > .v-btn__overlay {
      background-color: unset;
    }
  }
  :deep(.v-btn.v-btn--active) {
    .v-btn__content > span {
      font-size: 14px;
    }
  }
  :deep(.v-btn:not(.v-btn--active)) {
    filter: unset;
  }
  :deep(.v-badge__badge) {
    font-size: 14px;
    width: 22px;
    height: 22px;
  }
}

.v-theme--light {
  .app-navigation {
    &__container {
      border-top: 1px solid map-get($grey, 'lighten-2');
    }
    &.v-bottom-navigation {
      background-color: map-get($shades, 'white');
    }
    :deep(.v-btn.v-btn--active) {
      color: map-get($adm-colors, 'regular');
    }
    :deep(.v-btn:not(.v-btn--active)) {
      color: map-get($adm-colors, 'muted') !important;
    }
    :deep(.v-bottom-navigation__content) {
      border-top: 1px solid map-get($grey, 'lighten-2');
    }
  }
}

.v-theme--dark {
  .app-navigation {
    &.v-bottom-navigation {
      background-color: map-get($adm-colors, 'black');
    }
    :deep(.v-btn.v-btn--active) {
      color: map-get($shades, 'white');
    }
    :deep(.v-btn:not(.v-btn--active)) {
      color: map-get($adm-colors, 'grey-transparent');
    }
  }
}
</style>
