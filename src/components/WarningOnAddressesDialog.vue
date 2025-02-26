<template>
  <v-dialog v-model="show" width="500" :class="className" @keydown.enter="onEnter">
    <v-card>
      <v-card-title class="a-text-header">
        {{ header }}
      </v-card-title>

      <v-divider class="a-divider" />

      <!-- eslint-disable vue/no-v-html -- Safe with DOMPurify.sanitize() content -->
      <v-card-text>
        <div :class="`${className}__disclaimer a-text-regular-enlarged`" v-html="content" />
      </v-card-text>
      <!-- eslint-enable vue/no-v-html -->

      <v-col cols="12" class="text-center">
        <v-btn :class="[`${className}__btn-hide`, 'a-btn-primary']" @click="hide()">
          <v-icon :class="`${className}__btn-icon`" :icon="mdiAlert" />
          <div :class="`${className}__btn-text`">
            {{ $t('warning_on_addresses.hide_button') }}
          </div>
        </v-btn>
      </v-col>

      <v-col cols="12" :class="`${className}__btn-forget`">
        <a class="a-text-active" @click="forget()">
          {{ $t('warning_on_addresses.forget_button') }}
        </a>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
import { vueBus } from '@/lib/vueBus'
import DOMPurify from 'dompurify'
import { mdiAlert } from '@mdi/js'

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
      mdiAlert
    }
  },
  data: () => ({
    header: '',
    content: ''
  }),
  computed: {
    className: () => 'warning-on-addresses-dialog',
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  created() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const dialog = this
    vueBus.on('warningOnAddressDialog', function (validateSummary) {
      if (!validateSummary.isAllRight) {
        dialog.header =
          dialog.$t('warning_on_addresses.warning') +
          ': ' +
          dialog.$t('warning_on_addresses.headline')
        let contents = '<p>' + dialog.$t('warning_on_addresses.about') + '</p>'

        if (validateSummary.isWrongAddress) {
          contents +=
            '<p class="a-text-attention">' +
            dialog.$t('warning_on_addresses.specifics_wrong_addresses', {
              crypto: validateSummary.wrongCoin,
              storedAddress: validateSummary.storedAddress,
              correctAddress: validateSummary.correctAddress
            })
          if (validateSummary.wrongCoins.length > 1) {
            const wrongCoins = validateSummary.wrongCoins.join(', ')
            contents +=
              ' ' +
              dialog.$t('warning_on_addresses.full_list_wrong_addresses', {
                crypto_list: wrongCoins
              })
          }
          contents += '</p>'
        } else if (validateSummary.isManyAddresses) {
          const manyAddresses = validateSummary.manyAddresses.join(', ')
          contents +=
            '<p class="a-text-attention">' +
            dialog.$t('warning_on_addresses.specifics_many_addresses', {
              crypto: validateSummary.manyAddressesCoin,
              manyAddresses: manyAddresses
            })
          if (validateSummary.manyAddressesCoins.length > 1) {
            const wrongCoins = validateSummary.manyAddressesCoins.join(', ')
            contents +=
              ' ' +
              dialog.$t('warning_on_addresses.full_list_many_addresses', {
                crypto_list: wrongCoins
              })
          }
          contents += '</p>'
        }

        contents += '<p>' + dialog.$t('warning_on_addresses.reasons') + '</p>'
        contents += '<p>' + dialog.$t('warning_on_addresses.what_to_do') + '</p>'

        dialog.content = DOMPurify.sanitize(contents)
        dialog.show = true
      }
    })
  },
  methods: {
    hide() {
      this.show = false
    },
    forget() {
      this.$store.commit('options/updateOption', {
        key: 'suppressWarningOnAddressesNotification',
        value: true
      })
      this.hide()
    },
    onEnter() {
      if (this.show) {
        this.hide()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.warning-on-addresses-dialog {
  &__disclaimer {
    margin-top: 10px;
  }
  &__btn-hide {
    margin-top: 15px;
    margin-bottom: 20px;
  }
  &__btn-icon {
    margin-right: 8px;
  }
  &__btn-forget {
    padding-bottom: 30px;
    text-align: center;
  }
}
</style>
