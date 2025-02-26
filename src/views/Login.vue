<template>
  <v-row justify="center" no-gutters :class="className">
    <container>
      <div :class="`${className}__buttons`">
        <div class="text-right">
          <language-switcher :prepend-icon="mdiChevronRight" />
        </div>
        <div :class="`${className}__settings-button`">
          <v-btn @click="$router.push('/options/nodes')" icon variant="plain" :size="32">
            <v-icon :icon="mdiCog" />
          </v-btn>
        </div>
      </div>

      <v-sheet class="text-center mt-4" color="transparent">
        <logo style="width: 300px" />

        <h1 :class="`${className}__title`">
          {{ t('login.brand_title') }}
        </h1>
        <h2 :class="`${className}__subtitle`" class="hidden-sm-and-down mt-4">
          {{ t('login.subheader') }}
        </h2>
      </v-sheet>

      <v-sheet v-if="!isLoginViaPassword" class="text-center mt-4" color="transparent">
        <v-row justify="center" no-gutters>
          <v-col sm="8" md="8" lg="8">
            <login-form
              ref="loginForm"
              v-model="passphrase"
              @login="onLogin"
              @error="onLoginError"
            />
          </v-col>
        </v-row>

        <v-row justify="center" class="mt-4" no-gutters>
          <v-col cols="auto">
            <v-btn
              class="ma-2"
              :title="t('login.scan_qr_code_button_tooltip')"
              icon
              variant="text"
              size="x-small"
              :class="`${className}__icon`"
              @click="showQrcodeScanner = true"
            >
              <icon><qr-code-scan-icon /></icon>
            </v-btn>
          </v-col>

          <v-col cols="auto">
            <qrcode-capture @detect="onDetectQrcode" @error="onDetectQrcodeError">
              <v-btn
                class="ma-2"
                :title="t('login.login_by_qr_code_tooltip')"
                icon
                variant="text"
                size="x-small"
                :class="`${className}__icon`"
              >
                <icon><file-icon /></icon>
              </v-btn>
            </qrcode-capture>
          </v-col>
        </v-row>
      </v-sheet>

      <v-row v-if="!isLoginViaPassword" justify="center" class="mt-8">
        <v-col sm="8" md="8" lg="8">
          <passphrase-generator @copy="onCopyPassphrase" />
        </v-col>
      </v-row>

      <v-sheet v-if="isLoginViaPassword" class="text-center mt-6" color="transparent">
        <v-row no-gutters justify="center">
          <v-col sm="8" md="8" lg="8">
            <login-password-form v-model="password" @login="onLogin" @error="onLoginError" />
          </v-col>
        </v-row>
      </v-sheet>

      <qrcode-scanner-dialog
        v-if="showQrcodeScanner"
        v-model="showQrcodeScanner"
        @scan="onScanQrcode"
      />
    </container>
  </v-row>
</template>

<script>
import { nextTick, defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'

import QrcodeCapture from '@/components/QrcodeCapture.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import PassphraseGenerator from '@/components/PassphraseGenerator.vue'
import LoginForm from '@/components/LoginForm.vue'
import QrcodeScannerDialog from '@/components/QrcodeScannerDialog.vue'
import Icon from '@/components/icons/BaseIcon.vue'
import QrCodeScanIcon from '@/components/icons/common/QrCodeScan.vue'
import FileIcon from '@/components/icons/common/File.vue'
import LoginPasswordForm from '@/components/LoginPasswordForm.vue'
import Logo from '@/components/icons/common/Logo.vue'
import { navigateByURI } from '@/router/navigationGuard'
import { useI18n } from 'vue-i18n'
import { mdiCog, mdiChevronRight } from '@mdi/js'

export default defineComponent({
  components: {
    LanguageSwitcher,
    PassphraseGenerator,
    LoginForm,
    QrcodeScannerDialog,
    QrcodeCapture,
    Icon,
    QrCodeScanIcon,
    FileIcon,
    LoginPasswordForm,
    Logo
  },
  setup() {
    const passphrase = ref('')
    const password = ref('')
    const showQrcodeScanner = ref(false)
    const logo = '/img/adamant-logo-transparent-512x512.png'
    const store = useStore()
    const { t } = useI18n()
    const className = 'login-page'
    const loginForm = ref(null)

    const isLoginViaPassword = computed(() => store.getters['options/isLoginViaPassword'])

    const onDetectQrcode = (passphrase) => {
      onScanQrcode(passphrase)
    }
    const onDetectQrcodeError = (err) => {
      passphrase.value = ''
      store.dispatch('snackbar/show', {
        message: t('login.invalid_qr_code')
      })
      console.warn(err)
    }
    const onLogin = () => {
      if (!store.state.chat.isFulfilled) {
        store.commit('chat/createAdamantChats')
        store.dispatch('chat/loadChats').then(() => store.dispatch('startInterval'))
      } else {
        store.dispatch('startInterval')
      }

      navigateByURI()
    }
    const onLoginError = (errorMessage) => {
      store.dispatch('snackbar/show', {
        message: errorMessage,
        timeout: 3000
      })
    }
    const onCopyPassphrase = () => {
      store.dispatch('snackbar/show', {
        message: t('home.copied'),
        timeout: 2000
      })
    }
    const onScanQrcode = (value) => {
      passphrase.value = value
      nextTick(() => loginForm.value.submit())
    }

    return {
      passphrase,
      password,
      showQrcodeScanner,
      logo,
      className,
      isLoginViaPassword,
      t,
      loginForm,
      mdiCog,
      mdiChevronRight,
      onDetectQrcode,
      onDetectQrcodeError,
      onLogin,
      onLoginError,
      onCopyPassphrase,
      onScanQrcode
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.login-page {
  height: 100%;

  &__title {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
      Arial, sans-serif;
    font-weight: 100;
    font-size: 40px;
    line-height: 40px;
    text-transform: uppercase;
  }
  &__subtitle {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
      Arial, sans-serif;
    font-weight: 100;
    font-size: 18px;
  }
  &__icon {
    transition: 0.2s linear;
  }
  &__buttons {
    position: relative;
  }
  &__settings-button {
    position: absolute;
    right: 0;
    margin-right: 8px;
    color: map-get($adm-colors, 'grey-transparent');
  }
}

/** Themes **/
.v-theme--light {
  .login-page {
    &__icon,
    &__title,
    &__subtitle,
    &__settings-button {
      color: map-get($adm-colors, 'regular');
    }
  }
}
.v-theme--dark {
  .login-page {
    &__icon {
      color: map-get($shades, 'white');
    }
  }
}
</style>
