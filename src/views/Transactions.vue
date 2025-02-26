<template>
  <div id="txListElement">
    <app-toolbar-centered app :title="$t('transaction.transactions')" flat fixed />

    <v-container fluid class="px-0 container--with-app-toolbar">
      <v-row justify="center" no-gutters style="position: relative">
        <v-list-item v-if="isRecentLoading" style="position: absolute; top: 20px">
          <InlineSpinner />
        </v-list-item>

        <container v-if="isFulfilled">
          <v-list v-if="hasTransactions" lines="three" bg-color="transparent">
            <transaction-list-item
              v-for="(transaction, i) in transactions"
              :id="transaction.id"
              :key="i"
              :sender-id="sender(transaction)"
              :recipient-id="recipient(transaction)"
              :timestamp="transaction.timestamp || NaN"
              :amount="transaction.amount"
              :crypto="crypto"
              :status="transaction.status"
              :text-data="transaction.data"
              @click:transaction="goToTransaction"
              @click:icon="goToChat"
            />
            <v-list-item>
              <InlineSpinner v-if="isOlderLoading" />
            </v-list-item>
          </v-list>

          <h3 v-else class="a-text-caption text-center mt-6">
            {{ $t('transaction.no_transactions') }}
          </h3>
        </container>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import AppToolbarCentered from '@/components/AppToolbarCentered.vue'
import InlineSpinner from '@/components/InlineSpinner.vue'
import TransactionListItem from '@/components/TransactionListItem.vue'
import { isStringEqualCI } from '@/lib/textHelpers'
import { AllNodesDisabledError, AllNodesOfflineError } from '@/lib/nodes/utils/errors'

export default {
  components: {
    AppToolbarCentered,
    InlineSpinner,
    TransactionListItem
  },
  props: {
    crypto: {
      default: 'ADM',
      type: String
    }
  },
  data: () => ({
    isFulfilled: false,
    isRejected: false,
    isUpdating: false
  }),
  computed: {
    transactions() {
      const transactions = this.$store.getters[`${this.cryptoModule}/sortedTransactions`]
      const address = this.$store.state[this.crypto.toLowerCase()].address
      return transactions.filter((tx) => {
        // Filter invalid "fake" transactions (from chat rich message)
        return (
          Object.prototype.hasOwnProperty.call(tx, 'amount') &&
          (isStringEqualCI(tx.recipientId, address) || isStringEqualCI(tx.senderId, address))
        )
      })
    },
    hasTransactions() {
      return this.transactions && this.transactions.length > 0
    },
    isOlderLoading() {
      return this.$store.getters[`${this.cryptoModule}/areOlderLoading`]
    },
    isRecentLoading() {
      return this.$store.getters[`${this.cryptoModule}/areRecentLoading`]
    },
    cryptoModule() {
      return this.crypto.toLowerCase()
    }
  },
  watch: {
    '$store.state.IDBReady'() {
      if (this.$store.state.IDBReady) this.getNewTransactions()
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  mounted() {
    if (!this.$store.getters['options/isLoginViaPassword'] || this.$store.state.IDBReady) {
      this.getNewTransactions()
    }
    window.addEventListener('scroll', this.onScroll)
  },
  // mixins: [scrollPosition],
  methods: {
    sender(transaction) {
      const { senders, senderId } = transaction
      const onlySender = senderId && (!senders || senders.length === 1)
      if (onlySender) {
        return senderId
      } else if (senders) {
        return this.formatAddresses(senders)
      }
    },
    recipient(transaction) {
      const { recipientId, recipients } = transaction
      const onlyRecipient = recipientId && (!recipients || recipients.length === 1)
      if (onlyRecipient) {
        return recipientId
      } else if (recipients) {
        return this.formatAddresses(recipients)
      }
    },
    formatAddresses(addresses) {
      const count = addresses.length
      return addresses.includes(this.$store.state[this.crypto.toLowerCase()].address)
        ? `${
            this.$t('transaction.me') +
            ' (' +
            this.$store.state[this.cryptoModule].address +
            ') ' +
            this.$t('transaction.addresses', count - 1)
          }`
        : addresses[0] + ' ' + this.$t('transaction.addresses', count - 1)
    },
    goToTransaction(transactionId) {
      this.$router.push({
        name: 'Transaction',
        params: {
          crypto: this.crypto,
          txId: transactionId
        }
      })
    },
    goToChat(partnerId) {
      this.$router.push({
        name: 'Chat',
        params: { partnerId }
      })
    },
    onScroll() {
      const height = document.getElementById('txListElement').offsetHeight
      const windowHeight = window.innerHeight
      const scrollPosition = Math.ceil(
        window.scrollY ||
          window.pageYOffset ||
          document.body.scrollTop + (document.documentElement.scrollTop || 0)
      )
      // If we've scrolled to the very bottom, fetch the older transactions from server
      if (!this.isOlderLoading && windowHeight + scrollPosition >= height) {
        this.$store.dispatch(`${this.cryptoModule}/getOldTransactions`)
      }
      // If we've scrolled to the very top, fetch the recent transactions from server
      if (!this.isRecentLoading && scrollPosition === 0) {
        this.getNewTransactions()
      }
    },
    getNewTransactions() {
      // If we came from Transactions details sreen, do not update transaction list
      const doNotUpdate =
        this.$route.meta.previousRoute.params.txId &&
        !this.isFulfilled &&
        // If we don't just refresh Tx details screen
        this.$route.meta.previousPreviousRoute &&
        this.$route.meta.previousPreviousRoute.name

      if (doNotUpdate) {
        this.isFulfilled = true
      } else {
        this.$store
          .dispatch(`${this.cryptoModule}/getNewTransactions`)
          .then(() => {
            this.isFulfilled = true
          })
          .catch((err) => {
            this.isRejected = true
            let message = err.message
            if (err instanceof AllNodesOfflineError) {
              message = this.$t('errors.all_nodes_offline', {
                crypto: err.nodeLabel.toUpperCase()
              })
            } else if (err instanceof AllNodesDisabledError) {
              message = this.$t('errors.all_nodes_disabled', {
                crypto: err.nodeLabel.toUpperCase()
              })
            }
            this.$store.dispatch('snackbar/show', {
              message: message
            })
          })
      }
    }
  }
}
</script>
