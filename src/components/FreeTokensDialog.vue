<template>
  <v-dialog v-model="show" width="500" :class="className" @keydown.enter="onEnter">
    <v-card>
      <v-card-title class="a-text-header">
        {{ $t('chats.free_adm_title') }}
      </v-card-title>

      <v-divider class="a-divider" />

      <v-card-text :class="`${className}__card-text`">
        <div :class="`${className}__disclaimer a-text-regular-enlarged`">
          {{ $t('chats.free_adm_disclaimer') }}
        </div>
      </v-card-text>

      <v-col cols="12" class="text-center pa-0">
        <v-btn :class="[`${className}__btn-free-tokens`, 'a-btn-primary']" @click="getFreeTokens()">
          <v-icon :class="`${className}__btn-icon`" :icon="mdiGift" />
          <div :class="`${className}__btn-text`">
            {{ $t('home.free_adm_btn') }}
          </div>
        </v-btn>
      </v-col>

      <v-col cols="12" :class="`${className}__btn-show-article`">
        <a class="a-text-active" @click="showArticle()">
          {{ $t('chats.how_to_use_messenger') }}
        </a>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
import { websiteUriToOnion } from '@/lib/uri'
import { mdiGift } from '@mdi/js'

export default {
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup() {
    return {
      mdiGift
    }
  },
  computed: {
    className: () => 'free-tokens-dialog',
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {

    getFreeTokens() {
      const link = websiteUriToOnion(
        this.$t('home.free_tokens_link') + '?wallet=' + this.$store.state.address
      )
      window.open(link, '_blank', 'resizable,scrollbars,status,noopener')
      this.show = false
    },
    showArticle() {
      const link = this.$t('chats.how_to_use_messenger_link')
      window.open(link, '_blank', 'resizable,scrollbars,status,noopener')
    },
    onEnter() {
      if (this.show) {
        this.getFreeTokens()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'vuetify/_settings.scss';
@import '@/assets/styles/settings/_colors.scss';

.free-tokens-dialog {
  &__card-text {
    padding: 16px !important;
  }
  &__disclaimer {
    margin-top: 10px;
  }
  &__btn-free-tokens {
    margin-top: 15px;
    margin-bottom: 20px;
  }
  &__btn-icon {
    margin-right: 8px;
  }
  &__btn-show-article {
    padding: 0 0 30px 0;
    text-align: center;
  }
}

.v-theme--dark {
  .free-tokens-dialog {
    &__disclaimer {
      color: map-get($shades, 'white');
    }
  }
}
</style>
