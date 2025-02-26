<template>
  <div>
    <app-toolbar-centered app :title="$t('home.send_btn')" flat fixed />

    <v-container fluid class="px-0 container--with-app-toolbar">
      <v-row justify="center" no-gutters>
        <container padding>
          <send-funds-form
            class="pt-5"
            :crypto-currency="cryptoCurrency"
            :recipient-address="recipientAddress"
            :amount-to-send="amountToSend"
            :address-readonly="comeFromChat"
            :reply-to-id="$route.query.replyToId"
            @send="onSend"
            @error="onError"
          />
        </container>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import validateAddress from '@/lib/validateAddress'
import { isNumeric } from '@/lib/numericHelpers'

import AppToolbarCentered from '@/components/AppToolbarCentered.vue'
import SendFundsForm from '@/components/SendFundsForm.vue'
import { AllCryptos } from '@/lib/constants/cryptos'
import { vibrate } from '@/lib/vibrate'

export default {
  components: {
    AppToolbarCentered,
    SendFundsForm
  },
  data: () => ({
    cryptoCurrency: AllCryptos.ADM,
    recipientAddress: '',
    amountToSend: undefined
  }),
  computed: {
    comeFromChat() {
      return this.recipientAddress.length > 0
    }
  },
  created() {
    this.validateCryptoCurrency()
    this.validateRecipientAddress()
    this.validateAmountToSend()
  },
  methods: {
    validateCryptoCurrency() {
      if (
        this.$route.params.cryptoCurrency &&
        Object.keys(AllCryptos).includes(this.$route.params.cryptoCurrency)
      ) {
        this.cryptoCurrency = this.$route.params.cryptoCurrency
      }
    },
    validateRecipientAddress() {
      if (validateAddress('ADM', this.$route.params.recipientAddress)) {
        this.recipientAddress = this.$route.params.recipientAddress
      }
    },
    validateAmountToSend() {
      if (isNumeric(this.$route.params.amountToSend)) {
        this.amountToSend = parseFloat(this.$route.params.amountToSend)
      }
    },
    onSend(transactionId, crypto) {
      const userComeFrom = this.$route.query.from

      if (userComeFrom) {
        this.$router.replace(userComeFrom)
      } else {
        this.$router.replace(`/transactions/${crypto}/${transactionId}`)
      }
    },
    onError(message) {
      vibrate.doubleShort();
      this.$store.dispatch('snackbar/show', {
        message,
        timeout: 3000,
        variant: 'outlined'
      })
    }
  }
}
</script>
