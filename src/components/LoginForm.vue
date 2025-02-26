<template>
  <v-form ref="form" :class="classes.root" @submit.prevent="submit">
    <v-row no-gutters>
      <slot>
        <!--     Todo: check src/components/PasswordSetDialog.vue component and consider the possibility to move common code to new component  -->
        <v-text-field
          v-model="passphrase"
          :label="$t('login.password_label')"
          autocomplete="current-password"
          :class="classes.textField"
          class="text-center"
          :type="showPassphrase ? 'text' : 'password'"
          variant="underlined"
        >
          <template #append-inner>
            <v-btn
              @click="togglePassphraseVisibility"
              icon
              :ripple="false"
              :size="28"
              variant="plain"
            >
              <v-icon :icon="showPassphrase ? mdiEye : mdiEyeOff" :size="24" />
            </v-btn>
          </template>
        </v-text-field>
      </slot>

      <slot name="append-outer" />
    </v-row>

    <v-row align="center" justify="center" no-gutters>
      <slot name="button">
        <v-btn class="login-form__button a-btn-primary" @click="submit">
          <v-progress-circular
            v-show="showSpinner"
            indeterminate
            color="primary"
            size="24"
            class="mr-4"
          />
          {{ $t('login.login_button') }}
        </v-btn>
      </slot>
    </v-row>

    <transition name="slide-fade">
      <v-row justify="center" no-gutters>
        <slot name="qrcode-renderer" />
      </v-row>
    </transition>
  </v-form>
</template>

<script>
import { validateMnemonic } from 'bip39'
import { computed, ref, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import { isAllNodesOfflineError, isAllNodesDisabledError } from '@/lib/nodes/utils/errors'
import { mdiEye, mdiEyeOff } from '@mdi/js'


const className = 'login-form'
const classes = {
  root: className,
  textField: `${className}__textfield`
}

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['login', 'error', 'update:modelValue'],
  setup(props, { emit }) {
    const router = useRouter()
    const store = useStore()
    const { t } = useI18n()
    const showSpinner = ref(false)
    const showPassphrase = ref(false)
    const togglePassphraseVisibility = () => {
      showPassphrase.value = !showPassphrase.value
    }

    const passphrase = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    const isOnline = computed(() => store.getters['isOnline'])

    const submit = () => {
      if (!validateMnemonic(passphrase.value)) {
        return emit('error', t('login.invalid_passphrase'))
      }
      freeze()
      login()
    }
    const login = () => {
      const promise = store.dispatch('login', passphrase.value)
      promise
        .then(() => {
          emit('login')
        })
        .catch((err) => {
          if (!isOnline.value) {
            emit('error', t('connection.offline'))
            router.push({ name: 'Nodes' })
          } else if (isAxiosError(err)) {
            emit('error', t('login.invalid_passphrase'))
          } else if (isAllNodesOfflineError(err)) {
            emit('error', t('errors.all_nodes_offline', { crypto: err.nodeLabel.toUpperCase() }))
          } else if (isAllNodesDisabledError(err)) {
            emit('error', t('errors.all_nodes_disabled', { crypto: err.nodeLabel.toUpperCase() }))
            router.push({ name: 'Nodes' })
          } else {
            emit('error', t('errors.something_went_wrong'))
          }
          console.log(err)
        })
        .finally(() => {
          antiFreeze()
        })

      return promise
    }
    const freeze = () => {
      showSpinner.value = true
    }
    const antiFreeze = () => {
      showSpinner.value = false
    }

    return {
      showSpinner,
      passphrase,
      showPassphrase,
      classes,
      mdiEye,
      mdiEyeOff,
      togglePassphraseVisibility,
      submit
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

/** Themes **/
.v-theme--light {
  .login-form {
    &__textfield {
      color: map-get($adm-colors, 'regular');
    }
  }
}
.v-theme--dark {
  .login-form {
    &__textfield {
      color: map-get($shades, 'white');
    }
  }
}

</style>
