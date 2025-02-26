<template>
  <v-toolbar flat height="56" :class="`${className}`" color="transparent">
    <v-btn icon @click="goBack">
      <v-badge
        v-if="numOfNewMessages > 0"
        :value="numOfNewMessages"
        color="primary"
        :class="`${className}__messages-counter`"
        :content="numOfNewMessages > 99 ? '99+' : numOfNewMessages"
      >
      </v-badge>
      <v-icon :icon="mdiArrowLeft" />
    </v-btn>
    <div v-if="!isWelcomeChat(partnerId)">
      <slot name="avatar-toolbar" />
    </div>
    <div :class="`${className}__textfield-container`">
      <div
        v-if="isWelcomeChat(partnerId)"
        :class="`${className}__adm-chat-name`"
        :style="{ paddingLeft: '12px' }"
      >
        {{ $t('chats.virtual.welcome_message_title') }}
      </div>
      <div v-else>
        <v-text-field
          v-model="partnerName"
          :class="`${className}__textfield`"
          variant="plain"
          background-color="transparent"
          :label="partnerId"
          hide-details
          density="compact"
          :readonly="isAdamantChat(partnerId)"
        />
      </div>
    </div>

    <v-spacer />
  </v-toolbar>
</template>

<script>
import partnerName from '@/mixins/partnerName'
import { isAdamantChat, isWelcomeChat } from '@/lib/chat/meta/utils'
import { mdiArrowLeft } from '@mdi/js'

export default {
  mixins: [partnerName],
  props: {
    partnerId: {
      type: String,
      required: true
    }
  },
  emits: ['partner-info'],
  setup() {
    return {
      mdiArrowLeft
    }
  },
  computed: {
    className: () => 'chat-toolbar',
    partnerName: {
      get() {
        return this.getPartnerName(this.partnerId)
      },
      set(value) {
        this.$store.commit('partners/displayName', {
          partner: this.partnerId,
          displayName: value
        })
      }
    },
    numOfNewMessages() {
      return this.$store.getters['chat/numWithoutTheCurrentChat'](this.partnerId)
    }
  },
  data: () => ({
    lastPath: null
  }),
  created() {
    this.lastPath = this.$router.options.history.state.back
  },
  methods: {
    goBack() {
      if (this.lastPath === '/chats') {
        this.$router.back()
      } else {
        this.$router.push({ name: 'Chats' })
      }
    },
    showPartnerInfo() {
      this.$emit('partner-info', true)
    },
    isAdamantChat,
    isWelcomeChat
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/themes/adamant/_mixins.scss';
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.chat-toolbar {
  flex-grow: 0;
  flex-shrink: 0;

  &__messages-counter {
    position: relative;
    top: -14px;
    left: -2px;
  }
  &__textfield-container {
    width: 100%;
  }

  &__adm-chat-name {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  &__textfield {
    // hides TextField border bottom
    :deep(.v-input__control) {
      & > .v-input__slot:before {
        border-width: 0;
        border-color: unset;
      }

      & > .v-input__slot:after {
        border-width: 0;
        background-color: unset;
        border-color: unset;
      }
    }
  }

  :deep(.v-toolbar__content > .v-btn:first-child) {
    width: 36px;
    height: 36px;
    margin: 0 12px;
    border-radius: 50%;
  }

  :deep(.v-text-field) {
    @include a-text-regular-enlarged-bold();

    .v-field__field {
      .v-label.v-field-label {
        max-width: unset;
        @include a-text-regular-enlarged-bold();
        font-size: 16px;
      }
    }

    .v-field__input {
      line-height: 20px;
      padding-top: 20px;
      font-weight: 500;
    }

    .v-field__outline {
      .v-label.v-field-label.v-field-label--floating {
        line-height: 20px;
        font-size: 20px;
        transform: translateY(-6px) scale(0.6875);
        font-weight: 500;
      }
    }

    .v-input__control {
      padding: 0;
    }

    .v-input__control > .v-input__slot {
      margin-bottom: 0;
    }
  }

  :deep(.v-btn) {
    &:hover > .v-btn__overlay {
      opacity: 0.2;
      transition: all 0.4s ease;
    }
  }
}

/** Themes **/
.v-theme--light {
  .chat-toolbar {
    background-color: map-get($adm-colors, 'secondary2-transparent');

    :deep(.v-text-field) {
      .primary--text {
        color: map-get($grey, 'darken-1') !important;
      }
      .v-label {
        color: map-get($grey, 'darken-4');
      }
      .v-label--active {
        color: map-get($grey, 'darken-1');
      }
      input {
        caret-color: map-get($adm-colors, 'primary2');
      }
    }
  }
}
.v-theme--dark {
  .chat-toolbar {
    :deep(.v-text-field) {
      .primary--text {
        color: map-get($shades, 'white') !important;
      }
      .v-label {
        color: map-get($shades, 'white');
      }
      .v-label--active {
        color: map-get($shades, 'white');
      }
      input {
        caret-color: map-get($adm-colors, 'primary');
      }
    }
  }
}
</style>
