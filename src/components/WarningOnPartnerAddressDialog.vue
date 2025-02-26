<template>
  <v-dialog v-model="show" width="500" :class="className" @keydown.enter="onEnter">
    <v-card>
      <v-card-title class="a-text-header">
        {{ header() }}
      </v-card-title>

      <v-divider class="a-divider" />

      <!-- eslint-disable vue/no-v-html -- Safe with DOMPurify.sanitize() content -->
      <v-card-text>
        <div :class="`${className}__disclaimer a-text-regular-enlarged`" v-html="content()" />
      </v-card-text>
      <!-- eslint-enable vue/no-v-html -->

      <v-col cols="12" class="text-center">
        <v-btn :class="[`${className}__btn-hide`, 'a-btn-primary']" @click="hide()">
          <v-icon :class="`${className}__btn-icon`" :icon="mdiAlert" />
          <div :class="`${className}__btn-text`">
            {{ $t('transfer.warning_on_partner_address.hide_button') }}
          </div>
        </v-btn>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
import DOMPurify from 'dompurify'
import { mdiAlert } from '@mdi/js'

export default {
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    info: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup() {
    return {
      mdiAlert
    }
  },
  computed: {
    className: () => 'warning-on-partner-address-dialog',
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
    header: function () {
      return (
        this.$t('transfer.warning_on_partner_address.warning') +
        ': ' +
        this.$t('transfer.warning_on_partner_address.headline')
      )
    },
    content: function () {
      let contents = '<p>' + this.$t('transfer.warning_on_partner_address.about') + '</p>'
      contents +=
        '<p class="a-text-attention">' +
        this.$t('transfer.warning_on_partner_address.specifics_many_addresses', {
          crypto: this.info.coin,
          partner_account: this.info.ADMaddress,
          partner_name: this.info.ADMname,
          manyAddresses: this.info.coinAddresses
        })
      contents += '</p>'
      contents += '<p>' + this.$t('transfer.warning_on_partner_address.reasons')
      contents += ' ' + this.$t('transfer.warning_on_partner_address.what_to_do') + '</p>'
      contents = DOMPurify.sanitize(contents)
      return contents
    },
    hide() {
      this.show = false
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
.warning-on-partner-address-dialog {
  &__disclaimer {
    margin-top: 10px;
  }
  &__btn-hide {
    margin-top: 15px;
    margin-bottom: 30px;
  }
  &__btn-icon {
    margin-right: 8px;
  }
}
</style>
