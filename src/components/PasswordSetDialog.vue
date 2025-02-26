<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-card-title class="a-text-header">
        {{ $t('login_via_password.popup_title') }}
      </v-card-title>

      <v-divider class="a-divider" />

      <v-card-text class="pa-4">
<!--     Todo: check src/components/LoginForm.vue component and consider the possibility to move common code to new component  -->
        <v-text-field
          v-model="password"
          color="primary"
          autofocus
          autocomplete="new-password"
          class="a-input"
          :type="showPassword ? 'text' : 'password'"
          variant="underlined"
          :label="$t('login_via_password.enter_password')"
          :name="Date.now()"
          @keyup.enter="submit"
        >
          <template #append-inner>
            <v-btn
              @click="togglePasswordVisibility"
              icon
              :ripple="false"
              :size="28"
              variant="plain"
            >
              <v-icon :icon="showPassword ? mdiEye : mdiEyeOff" :size="24" />
            </v-btn>
          </template>
        </v-text-field>

        <div class="a-text-regular-enlarged">
          {{ $t('login_via_password.article_hint') }}
          <a @click="openLink(userPasswordAgreementLink)">{{ $t('login_via_password.article') }}</a
          >.
        </div>
      </v-card-text>

      <v-card-actions class="pa-3">
        <v-spacer />

        <v-btn variant="text" class="a-btn-regular" @click="show = false">
          {{ $t('transfer.confirm_cancel') }}
        </v-btn>

        <v-btn
          variant="text"
          class="a-btn-regular"
          :disabled="!isValidForm || disabledButton"
          @click="submit"
        >
          <v-progress-circular
            v-show="showSpinner"
            indeterminate
            color="primary"
            size="24"
            class="mr-4"
          />
          {{ $t('login_via_password.popup_confirm_text') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { UserPasswordArticleLink } from '@/lib/constants'
import { saveState } from '@/lib/idb/state'
import { mdiEye, mdiEyeOff } from '@mdi/js'


export default {
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['password', 'update:modelValue'],
  setup() {

    return {
      mdiEye,
      mdiEyeOff
    }
  },
  data: () => ({
    password: '',
    showSpinner: false,
    disabledButton: false,
    userPasswordAgreementLink: UserPasswordArticleLink,
    showPassword: false
  }),
  computed: {
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    isValidForm() {
      return this.password.length > 0
    }
  },
  methods: {
    openLink(link) {
      window.open(link, '_blank', 'resizable,scrollbars,status,noopener')
    },
    submit() {
      if (!this.isValidForm) {
        return
      }
      this.disabledButton = true
      this.showSpinner = true

      this.$store
        .dispatch('setPassword', this.password)
        .then((encodedPassword) => {
          this.password = ''

          this.$emit('password', encodedPassword)

          return encodedPassword
        })
        .then(() => {
          return saveState(this.$store)
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          this.disabledButton = false
          this.showSpinner = false
          this.show = false
        })
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    }
  }
}
</script>
