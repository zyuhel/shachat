<template>
  <div :class="className">
    <warning-on-partner-address-dialog
      v-model="showWarningOnPartnerAddressDialog"
      :info="warningOnPartnerInfo"
    />

    <v-form ref="form" v-model="validForm" @submit.prevent="confirm">
      <v-select
        v-model="currency"
        class="a-input"
        variant="underlined"
        :items="cryptoList"
        :disabled="addressReadonly"
        :menu-icon="addressReadonly ? '' : mdiMenuDown"
      />

      <v-text-field
        v-model.trim="cryptoAddress"
        :disabled="addressReadonly"
        class="a-input"
        type="text"
        variant="underlined"
        color="primary"
        @paste="onPasteURIAddress"
      >
        <template #label>
          <span v-if="recipientName && addressReadonly" class="font-weight-medium">
            {{ $t('transfer.to_name_label', { name: recipientName }) }}
          </span>
          <span v-else class="font-weight-medium">
            {{ $t('transfer.to_address_label') }}
          </span>
        </template>
        <template v-if="!addressReadonly" #append-inner>
          <v-menu :offset-overflow="true" :offset-y="false" left eager>
            <template #activator="{ props }">
              <v-icon v-bind="props" :icon="mdiDotsVertical" />
            </template>
            <v-list>
              <v-list-item @click="showQrcodeScanner = true">
                <v-list-item-title>{{ $t('transfer.decode_from_camera') }}</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>
                  <qrcode-capture @detect="onDetectQrcode" @error="onDetectQrcodeError">
                    <span>{{ $t('transfer.decode_from_image') }}</span>
                  </qrcode-capture>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-text-field>

      <v-text-field
        v-model="amountString"
        class="a-input"
        :class="`${className}__amount-input`"
        variant="underlined"
        :max="maxToTransfer"
        :min="minToTransfer"
        :step="minToTransfer"
        type="number"
        color="primary"
      >
        <template #label>
          <span class="font-weight-medium">{{ $t('transfer.amount_label') }}</span>
          <span class="max-amount-label">
            &nbsp;{{ `(max: ${maxToTransferFixed} ${currency})` }}
          </span>
        </template>
        <template #append-inner>
          <v-menu :offset-overflow="true" :offset-y="false" left>
            <template #activator="{ props }">
              <v-icon v-bind="props" :icon="mdiDotsVertical" />
            </template>
            <v-list>
              <v-list-item
                v-for="item in amountMenuItems"
                :key="item.title"
                @click="divideAmount(item.divider)"
              >
                <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-text-field>
      <div class="fake-input">
        <div class="fake-input__label">
          {{ transferFeeLabel }}
        </div>
        <div class="fake-input__box">
          <span class="fake-input__value"> {{ transferFeeFixed }} {{ transferFeeCurrency }} </span>
          <span class="fake-input__value fake-input__value--rate a-text-regular">
            ~{{ transferFeeRate }}
          </span>
        </div>
      </div>
      <div v-if="!hideFinalAmount" class="fake-input">
        <div class="fake-input__label">
          {{ $t('transfer.final_amount_label') }}
        </div>
        <div class="fake-input__box">
          <span class="fake-input__value"> {{ finalAmountFixed }} {{ currency }} </span>
          <span class="fake-input__value fake-input__value--rate a-text-regular">
            ~{{ finalAmountRate }}
          </span>
        </div>
      </div>
      <v-text-field
        v-if="addressReadonly"
        v-model="comment"
        :label="$t('transfer.comments_label')"
        class="a-input"
        counter
        variant="underlined"
        maxlength="100"
        @paste="onPasteURIComment"
        color="primary"
      />

      <v-text-field
        v-if="isTextDataAllowed"
        v-model="textData"
        class="a-input"
        :label="textDataLabel"
        variant="underlined"
        counter
        maxlength="64"
        color="primary"
      />
      <v-checkbox
        v-if="allowIncreaseFee"
        v-model="increaseFee"
        :label="$t('transfer.increase_fee')"
        color="grey darken-1"
      />
      <v-checkbox v-if="debug" v-model="dryRun" label="Dry run" color="grey darken-1" />

      <div class="text-center">
        <v-btn :class="`${className}__button`" class="a-btn-primary" @click="confirm">
          {{ $t('transfer.send_button') }}
        </v-btn>
      </div>
    </v-form>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="a-text-header">
          {{ $t('transfer.confirm_title') }}
        </v-card-title>

        <v-divider class="a-divider" />

        <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- Safe internal content -->
        <v-card-text class="a-text-regular-enlarged pa-4" v-html="confirmMessage" />

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn class="a-btn-regular" variant="text" @click="dialog = false">
            {{ $t('transfer.confirm_cancel') }}
          </v-btn>

          <v-btn class="a-btn-regular" variant="text" :disabled="disabledButton" @click="submit">
            <v-progress-circular
              v-show="showSpinner"
              indeterminate
              color="primary"
              size="24"
              class="mr-4"
            />
            {{ $t('transfer.confirm_approve') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <qrcode-scanner-dialog
      v-if="showQrcodeScanner"
      v-model="showQrcodeScanner"
      @scan="onScanQrcode"
    />
  </div>
</template>

<script>
import { adm } from '@/lib/nodes'
import klyIndexer from '@/lib/nodes/kly-indexer'
import { AllNodesDisabledError, AllNodesOfflineError, NoInternetConnectionError } from '@/lib/nodes/utils/errors'
import { PendingTransactionError } from '@/lib/pending-transactions'
import axios from 'axios'
import { computed, nextTick } from 'vue'

import QrcodeCapture from '@/components/QrcodeCapture.vue'
import QrcodeScannerDialog from '@/components/QrcodeScannerDialog.vue'
import get from 'lodash/get'
import { BigNumber } from 'bignumber.js'
import * as transactions from '@klayr/transactions'
import { KLY_DECIMALS } from '@/lib/klayr/klayr-constants'

import {
  INCREASE_FEE_MULTIPLIER,
  Cryptos,
  TransactionStatus as TS,
  isErc20,
  isFeeEstimate,
  isEthBased,
  getMinAmount,
  isSelfTxAllowed,
  CryptosInfo,
  isTextDataAllowed,
  MessageType,
  Fees,
  Symbols
} from '@/lib/constants'

import { parseURI } from '@/lib/uri'
import { sendMessage } from '@/lib/adamant-api'
import { replyMessageAsset } from '@/lib/adamant-api/asset'

import validateAddress from '@/lib/validateAddress'
import { formatNumber, isNumeric } from '@/lib/numericHelpers'
import partnerName from '@/mixins/partnerName'

import WarningOnPartnerAddressDialog from '@/components/WarningOnPartnerAddressDialog.vue'
import { isStringEqualCI } from '@/lib/textHelpers'
import { formatSendTxError } from '@/lib/txVerify'
import { AllCryptos } from '@/lib/constants/cryptos'

import { MAX_UINT64 } from '@klayr/validator'

import { mdiDotsVertical, mdiMenuDown } from '@mdi/js'
import { useStore } from 'vuex'


/**
 * @returns {string | boolean}
 */
function validateForm() {
  const errorMessage = Object.entries(this.validationRules)
    .flatMap(([property, validators]) => {
      const propertyValue = this[property]

      return validators
        .map((validator) => validator.call(this, propertyValue))
        .filter((v) => v !== true) // returns only errors
    })
    .slice(0, 1) // get first error
    .join() // array to string

  return errorMessage || true
}

export default {
  components: {
    QrcodeCapture,
    QrcodeScannerDialog,
    WarningOnPartnerAddressDialog
  },
  mixins: [partnerName],
  props: {
    cryptoCurrency: {
      type: String,
      default: 'ADM',
      validator: (value) => value in AllCryptos
    },
    recipientAddress: {
      type: String,
      default: ''
    },
    amountToSend: {
      type: Number,
      default: 0
    },
    addressReadonly: {
      type: Boolean,
      default: false
    },
    replyToId: {
      type: String
    }
  },
  emits: ['send', 'error'],
  setup() {
    const store = useStore()

    const isOnline = computed(() => store.getters['isOnline'])

    const checkIsOnline = () => {
      return navigator.onLine || isOnline.value;
    }

    return {
      checkIsOnline,
      mdiDotsVertical,
      mdiMenuDown
    }
  },
  data: () => ({
    currency: '',
    address: '',
    cryptoAddress: '',
    amountString: '',
    amount: 0,
    amountMenuItems: [
      {
        divider: 10,
        title: 'transfer.amount_percent_10'
      },
      {
        divider: 3,
        title: 'transfer.amount_percent_33'
      },
      {
        divider: 2,
        title: 'transfer.amount_percent_50'
      },
      {
        divider: 1,
        title: 'transfer.amount_percent_100'
      }
    ],
    comment: '',
    textData: '',
    validForm: true,
    disabledButton: false,
    showQrcodeScanner: false,
    showSpinner: false,
    dialog: false,
    fetchAddress: null, // fn throttle
    increaseFee: false,
    showWarningOnPartnerAddressDialog: false,
    warningOnPartnerInfo: {},
    klayrOptionalMessage: '',

    // Account exists check
    // Currently works only with KLY
    account: {
      isNew: false,
      abortController: new AbortController(),
      loading: false
    },

    // Debugging section
    dryRun: false,
    debug: !!localStorage.getItem('DEBUG')
  }),
  computed: {
    className: () => 'send-funds-form',

    /**
     * Some cryptos allows to save public data with a Tx
     * @returns {boolean}
     */
    isTextDataAllowed() {
      return isTextDataAllowed(this.currency) && !this.addressReadonly
    },

    /**
     * Label for a textData input
     * @returns {string}
     */
    textDataLabel() {
      return this.$t('transfer.textdata_label', { crypto: CryptosInfo[this.currency].name })
    },

    /**
     * @returns {number}
     */
    transferFee() {
      return this.calculateTransferFee(this.amount)
    },

    /**
     * String representation of `this.transferFee`
     * @returns {string}
     */
    transferFeeFixed() {
      return BigNumber(this.transferFee).toFixed()
    },

    /**
     * Label for fee field. Estimate fee or precise value.
     * @returns {string}
     */
    transferFeeLabel() {
      return isFeeEstimate(this.currency)
        ? this.$t('transfer.commission_estimate_label')
        : this.$t('transfer.commission_label')
    },

    /**
     * Transfer currency (may differ from the amount currency in case of ERC-20 tokens)
     * @returns {string}
     */
    transferFeeCurrency() {
      return isErc20(this.currency) ? AllCryptos.ETH : this.currency
    },

    /**
     * @returns {number}
     */
    finalAmount() {
      return isErc20(this.currency)
        ? this.amount
        : BigNumber.sum(this.amount, this.transferFee).toNumber()
    },

    /**
     * String representation of `this.finalAmount`
     * @returns {string}
     */
    finalAmountFixed() {
      return BigNumber(this.finalAmount).toFixed()
    },

    /**
     * Indicates whether final amount field should be hidden (e.g., for the ERC20 tokens)
     * @returns {boolean}
     */
    hideFinalAmount() {
      return isErc20(this.currency)
    },

    /**
     * Return balance of specific cryptocurrency
     * @returns {number}
     */
    balance() {
      return this.currency === Cryptos.ADM
        ? this.$store.state.balance
        : this.$store.state[this.currency.toLowerCase()].balance
    },

    /**
     * Return ADM balance
     * @returns {number}
     */
    admBalance() {
      return this.$store.state.balance
    },

    ethBalance() {
      return this.$store.state.eth.balance
    },

    /**
     * @returns {number}
     */
    maxToTransfer() {
      // ERC20 tokens are feed in ETH, so the fee itself does not affect balance
      if (isErc20(this.currency)) {
        return this.balance
      }

      if (this.balance < this.transferFee) return 0

      let amount = BigNumber(this.balance)

      // Some cryptos require minimum balance to maintain on a wallet
      const { minBalance } = CryptosInfo[this.currency]
      amount = amount.minus(minBalance || 0)

      const amt = amount.minus(this.calculateTransferFee(this.balance)).toNumber()

      return Math.max(amt, 0)
    },
    /**
     * String representation of `this.maxToTransfer`
     * @returns {string}
     */
    maxToTransferFixed() {
      return formatNumber(this.exponent)(this.maxToTransfer)
    },

    /**
     * Minimum amount to transfer
     * @returns {number}
     */
    minToTransfer() {
      return 10 ** (this.exponent * -1)
    },

    /**
     * Own address depending on selected currency
     * @returns {string}
     */
    ownAddress() {
      return this.$store.state[this.currency.toLowerCase()].address
    },
    recipientName() {
      return this.getPartnerName(this.address)
    },
    exponent() {
      return CryptosInfo[this.currency].cryptoTransferDecimals
    },
    orderedVisibleWalletSymbols() {
      return this.$store.getters['wallets/getVisibleOrderedWalletSymbols']
    },
    cryptoList() {
      return this.orderedVisibleWalletSymbols.map((crypto) => {
        return crypto.symbol
      })
    },
    confirmMessage() {
      const msgType =
        this.recipientName && this.addressReadonly
          ? 'transfer.confirm_message_with_name'
          : 'transfer.confirm_message'

      return this.$t(msgType, {
        amount: BigNumber(this.amount).toFixed(),
        crypto: this.currency,
        name: this.recipientName,
        address: this.cryptoAddress,
        fee: this.transferFee
      })
    },
    validationRules() {
      return {
        cryptoAddress: [
          (v) =>
            validateAddress(this.currency, v) ||
            this.$t('transfer.error_incorrect_address', { crypto: this.currency }),
          (v) =>
            !isStringEqualCI(v, this.ownAddress) ||
            isSelfTxAllowed(this.currency) ||
            this.$t('transfer.error_same_recipient')
        ],
        amount: [
          (v) => v > 0 || this.$t('transfer.error_incorrect_amount'),
          () => {
            const isAdmTransfer = this.currency === Cryptos.ADM
            const isDirectTransfer = !this.address

            if (isAdmTransfer || isDirectTransfer) {
              return true // skips validation
            }

            return (
              this.admBalance >= Fees.NOT_ADM_TRANSFER ||
              this.$t('transfer.error_not_enough_adm_fee')
            )
          },
          () => this.amount <= this.maxToTransfer || this.$t('transfer.error_not_enough'),
          (v) => this.validateMinAmount(v, this.currency) || this.$t('transfer.error_dust_amount'),
          (v) => this.validateNaturalUnits(v, this.currency) || this.$t('transfer.error_precision'),
          () =>
            isErc20(this.currency)
              ? this.ethBalance >= this.transferFee || this.$t('transfer.error_not_enough_eth_fee')
              : true,
          (v) => {
            const isKlyTransfer = this.currency === Cryptos.KLY
            if (!isKlyTransfer) return true
            const isKlyTransferAllowed =
              this.transferFee &&
              transactions.convertklyToBeddows(v.toFixed(KLY_DECIMALS)) < MAX_UINT64
            return isKlyTransferAllowed || this.$t('transfer.error_incorrect_amount')
          }
        ]
      }
    },
    allowIncreaseFee() {
      return this.currency === Cryptos.BTC || isEthBased(this.currency)
    },
    currentCurrency: {
      get() {
        return this.$store.state.options.currentRate
      },
      set(value) {
        this.$store.commit('options/updateOption', {
          key: 'currentRate',
          value
        })
      }
    },
    transferFeeRate() {
      const currentRate =
        this.$store.state.rate.rates[`${this.transferFeeCurrency}/${this.currentCurrency}`]

      if (currentRate === undefined) {
        return Symbols.HOURGLASS
      }

      const feeRate = (this.transferFeeFixed * currentRate).toFixed(2)

      return `${feeRate} ${this.currentCurrency}`
    },
    finalAmountRate() {
      const currentRate = this.$store.state.rate.rates[`${this.currency}/${this.currentCurrency}`]

      if (currentRate === undefined) {
        return Symbols.HOURGLASS
      }

      const amountRate = (this.finalAmountFixed * currentRate).toFixed(2)

      return `${amountRate} ${this.currentCurrency}`
    }
  },
  watch: {
    amountString(value) {
      if (isNumeric(value) && value > 0) {
        this.amount = +value
      } else {
        this.amount = 0
      }
    },
    cryptoAddress(cryptoAddress) {
      this.checkIsNewAccount(cryptoAddress)
    }
  },
  created() {
    this.currency = this.cryptoCurrency
    this.address = this.recipientAddress
    this.amount = this.amountToSend

    // create watcher after setting default from props
    this.$watch('currency', () => {
      this.$refs.form.validate()
    })
  },
  mounted() {
    this.fetchUserCryptoAddress()
  },
  methods: {
    checkIsNewAccount(cryptoAddress) {
      this.account.isNew = false

      if (!validateAddress(this.currency, cryptoAddress)) {
        return
      }

      // Cancel the previous fetch request
      this.account.abortController.abort()

      // Create a new AbortController for the current request
      this.account.abortController = new AbortController()

      switch (this.currency) {
        case Cryptos.KLY:
          this.account.loading = true
          klyIndexer
            .checkAccountExists(cryptoAddress, {
              signal: this.account.abortController.signal
            })
            .then((exists) => {
              this.account.isNew = !exists
            })
            .catch((err) => {
              if (axios.isCancel(err)) {
                // Request canceled
                return
              }

              throw err
            })
            .finally(() => {
              this.account.loading = false
            })

          break
      }
    },
    confirm() {
      const abstract = validateForm.call(this)

      if (abstract === true) {
        this.dialog = true
      } else {
        this.$store.dispatch('snackbar/show', {
          message: abstract,
          timeout: 3500
        })
      }
    },

    /**
     * Handle successful address decode from a QR code
     * @param {string} address Address
     */
    onDetectQrcode(address) {
      this.onScanQrcode(address)
    },

    /**
     * Handle failed address decode from a QR code
     * @param {string} error Error instance
     */
    onDetectQrcodeError(error) {
      this.cryptoAddress = ''
      this.$store.dispatch('snackbar/show', {
        message: this.$t('transfer.invalid_qr_code')
      })
      console.warn(error)
    },

    /**
     * Parse address from an URI on paste text
     * @param {ClipboardEvent} e Event
     */
    onPasteURIAddress(e) {
      const data = e.clipboardData.getData('text')
      const address = parseURI(data).address

      if (validateAddress(this.currency, address)) {
        e.preventDefault()
        this.cryptoAddress = address
      } else {
        this.$emit('error', this.$t('transfer.error_incorrect_address', { crypto: this.currency }))
      }
    },

    /**
     * Parse comment from an URI on paste text
     * @param {string} e Event
     */
    onPasteURIComment(e) {
      nextTick(() => {
        const params = parseURI(e.target.value).params

        if (params.message) {
          this.comment = params.message
        }
      })
    },

    /**
     * Parse info from an URI
     * @param {string} uri URI
     */
    onScanQrcode(uri) {
      const recipient = parseURI(uri)
      const { params, address, crypto } = recipient
      const isValidAddress = validateAddress(this.currency, address)
      if (isValidAddress) {
        this.cryptoAddress = address
        if (params.amount && !this.amountString) {
          const amount = formatNumber(this.exponent)(params.amount)
          if (Number(amount) <= this.maxToTransfer) {
            this.amountString = amount
          }
        }
        if (crypto === Cryptos.KLY) {
          this.textData = params.reference ? params.reference : ''
        }
      } else {
        this.$emit('error', this.$t('transfer.error_incorrect_address', { crypto: this.currency }))
      }
    },
    submit() {
      this.disabledButton = true
      this.showSpinner = true

      return this.sendFunds()
        .then((transactionId) => {
          if (!transactionId) {
            throw new Error(this.$t('transfer.error_no_hash'))
          }

          if (this.currency === Cryptos.ADM) {
            // push fast transaction if come from chat
            if (this.address) {
              this.pushTransactionToChat(transactionId, this.cryptoAddress)
            }
          } else {
            // other cryptos
            // if come from chat
            if (this.address) {
              this.pushTransactionToChat(transactionId, this.address)
            }
          }

          this.$emit('send', transactionId, this.currency)
        })
        .catch((error) => {
          const formattedError = formatSendTxError(error)
          console.warn('Error while sending transaction', formattedError)
          let message = formattedError.errorMessage
          if (/dust/i.test(message) || get(error, 'response.data.error.code') === -26) {
            message = this.$t('transfer.error_dust_amount')
          } else if (/minimum remaining balance requirement/i.test(message)) {
            message = this.$t('transfer.recipient_minimum_balance')
          } else if (/Invalid JSON RPC Response/i.test(message)) {
            message = this.$t('transfer.error_unknown')
          } else if (error instanceof AllNodesOfflineError) {
            if (this.currency !== Cryptos.ADM && error.nodeLabel === 'adm') {
              message = this.$t('errors.all_adm_nodes_offline')
            } else {
              message = this.$t('errors.all_nodes_offline', {
                crypto: error.nodeLabel.toUpperCase()
              })
            }
          } else if (error instanceof AllNodesDisabledError) {
            message = this.$t('errors.all_nodes_disabled', {
              crypto: error.nodeLabel.toUpperCase()
            })
          } else if (error instanceof PendingTransactionError) {
            message = this.$t('transfer.error_pending_transaction', {
              crypto: error.crypto
            })
          } else if (error instanceof NoInternetConnectionError) {
            message = this.$t('connection.offline')
          }
          this.$emit('error', message)
        })
        .finally(() => {
          this.disabledButton = false
          this.showSpinner = false
          this.dialog = false
        })
    },
    async sendFunds() {
      if (!this.checkIsOnline()) {
        throw new NoInternetConnectionError()
      }

      if (this.currency === Cryptos.ADM) {
        let promise
        // 1. if come from Chat then sendMessage
        // 2. else send regular transaction with `type = 0`
        if (this.address) {
          const type = this.replyToId
            ? MessageType.RICH_CONTENT_MESSAGE
            : MessageType.BASIC_ENCRYPTED_MESSAGE
          const asset = this.replyToId
            ? replyMessageAsset({
                replyToId: this.replyToId,
                replyMessage: this.comment
              })
            : this.comment

          adm.assertAnyNodeOnline()
          promise = sendMessage({
            amount: this.amount,
            message: asset,
            to: this.cryptoAddress,
            type
          })
        } else {
          promise = this.$store.dispatch('adm/sendTokens', {
            address: this.cryptoAddress,
            amount: this.amount
          })
        }
        return promise.then((result) => result.transactionId)
      } else {
        return this.$store.dispatch(this.currency.toLowerCase() + '/sendTokens', {
          amount: this.amount,
          admAddress: this.address,
          address: this.cryptoAddress,
          comments: this.comment,
          fee: this.transferFee,
          increaseFee: this.increaseFee,
          textData: this.textData,
          replyToId: this.replyToId,
          dryRun: this.dryRun
        })
      }
    },

    /**
     * Divide amount by predefined value
     * @param {number} divider How much less to send
     */
    divideAmount(divider) {
      this.amountString = formatNumber(this.exponent)(this.maxToTransfer / divider)
    },
    pushTransactionToChat(transactionId, adamantAddress) {
      let amount = this.amount

      // unformat ADM `amount`
      if (this.currency === Cryptos.ADM) {
        amount = amount * 1e8
      }

      this.$store.dispatch('chat/pushTransaction', {
        transactionId,
        hash: transactionId,
        recipientId: adamantAddress,
        type: this.currency,
        status: TS.PENDING,
        amount,
        comment: this.comment,
        replyToId: this.replyToId
      })
    },
    fetchUserCryptoAddress() {
      if (this.currency === Cryptos.ADM) {
        this.cryptoAddress = this.address

        return
      }

      if (validateAddress('ADM', this.address)) {
        this.$store
          .dispatch('partners/fetchAddress', {
            crypto: this.currency,
            partner: this.address,
            records: 20
          })
          .then((addresses) => {
            this.cryptoAddress = addresses[0]
            if (addresses.length > 1) {
              const addressesList = addresses.join(', ')
              this.warningOnPartnerInfo.coin = this.currency
              this.warningOnPartnerInfo.ADMaddress = this.address
              this.warningOnPartnerInfo.ADMname = ''
              if (this.recipientName) {
                this.warningOnPartnerInfo.ADMname = ' (' + this.recipientName + ')'
              }
              this.warningOnPartnerInfo.coinAddresses = addressesList
              this.showWarningOnPartnerAddressDialog = true
            }
          })
      }
    },
    validateMinAmount(amount, currency) {
      const min = getMinAmount(currency)
      return amount >= min
    },
    validateNaturalUnits(amount, currency) {
      const units = CryptosInfo[currency].decimals

      const [, right = ''] = BigNumber(amount).toFixed().split('.')

      return right.length <= units
    },
    calculateTransferFee(amount) {
      const coef = this.increaseFee ? INCREASE_FEE_MULTIPLIER : 1
      return (
        coef *
        this.$store.getters[`${this.currency.toLowerCase()}/fee`](
          amount || this.balance,
          this.cryptoAddress,
          this.textData,
          this.account.isNew
        )
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.a-input :deep(input[type='number']) {
  -moz-appearance: textfield;
}
.a-input :deep(input[type='number']::-webkit-inner-spin-button),
.a-input :deep(input[type='number']::-webkit-outer-spin-button) {
  -webkit-appearance: none;
}
.send-funds-form {
  &__button {
    margin-top: 15px;
  }
  &__amount-input {
    :deep(.v-field__field) {
      .v-label.v-field-label {
        align-items: baseline;

        .max-amount-label {
          font-size: 14px;
        }
      }
    }

    :deep(.v-field__outline) {
      .v-label.v-field-label.v-field-label--floating .max-amount-label {
        font-size: 10.5px; // -25% from original size
        line-height: 1;
      }
    }
  }
}
</style>
