<template>
  <v-snackbar
    v-model="show"
    :timeout="timeout"
    :color="color"
    :class="[className, { outlined: variant === 'outlined' }]"
    :variant="variant"
    location="bottom"
    width="100%"
    :multi-line="message.length > 50"
    @click:outside="show = false"
  >
    <div :class="`${className}__container`">
      {{ message }}
      <v-btn
        v-if="timeout === 0 || timeout > 2000 || timeout === -1"
        size="x-small"
        variant="text"
        fab
        @click="show = false"
      >
        <v-icon :class="`${className}__icon`" :icon="mdiClose" size="dense" />
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script>
import { mdiClose } from '@mdi/js'

export default {
  setup() {
    return {
      mdiClose
    }
  },
  computed: {
    className: () => 'app-snackbar',
    show: {
      get() {
        return this.$store.state.snackbar.show
      },
      set(value) {
        if (!value) {
          this.$store.commit('snackbar/resetOptions', value)
        }

        this.$store.commit('snackbar/changeState', value)
      }
    },
    message() {
      return this.$store.state.snackbar.message
    },
    color() {
      return this.$store.state.snackbar.color
    },
    timeout() {
      return this.$store.state.snackbar.timeout
    },
    variant() {
      return this.$store.state.snackbar.variant
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import '@/assets/styles/settings/_colors.scss';

.app-snackbar {
  :deep(.v-snackbar__wrapper) {
    @include a-text-regular-enlarged();

    margin: 0 auto;
    border-radius: 0;
    max-width: 300px;
    border: 1px solid transparent;
  }

  :deep(.v-snackbar__content) {
    font-size: 16px;
    font-weight: 300;
  }

  &__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__close-button {
    min-width: unset;
    padding: 0;
    width: 36px;
  }

  &.outlined {
    :deep(.v-snackbar__wrapper) {
      border-color: map-get($adm-colors, 'danger');
    }
  }
}

.v-theme--light.app-snackbar {
  :deep(.v-snackbar__wrapper) {
    background-color: map-get($shades, 'white');
    color: map-get($adm-colors, 'regular');
  }
}

.v-theme--dark.app-snackbar {
  :deep(.v-snackbar__wrapper) {
    background-color: map-get($adm-colors, 'regular');
    color: map-get($shades, 'white');
  }
}
</style>
