'use strict'

import Notify from 'notifyjs'
import Visibility from 'visibilityjs'
import currency from '@/filters/currencyAmountWithSymbol'
import { removeFormats } from '@/lib/markdown'
import { isAdamantChat } from '@/lib/chat/meta/utils'

let _this

class Notification {
  constructor(ctx) {
    _this = ctx
    this.i18n = ctx.$i18n
    this.router = ctx.$router
    this.store = ctx.$store
    this.interval = null
  }

  get lastUnread() {
    const transaction = this.store.getters['chat/lastUnreadMessage']

    // don't show remove reaction
    if (transaction.type === 'reaction' && !transaction.asset.react_message) {
      return null
    }

    return transaction
  }

  get partnerAddress() {
    return this.lastUnread && this.lastUnread.senderId
  }

  get partnerIdentity() {
    const isAdmChat = isAdamantChat(this.partnerAddress)
    const name =
      this.store.getters['partners/displayName'](this.partnerAddress) || this.partnerAddress
    return isAdmChat ? this.i18n.t(name) : name
  }

  get pushAllowed() {
    return this.store.state.options.allowPushNotifications
  }

  get soundAllowed() {
    return this.store.state.options.allowSoundNotifications
  }

  get tabAllowed() {
    return this.store.state.options.allowTabNotifications
  }

  get tabHidden() {
    return Visibility.hidden()
  }

  get unreadAmount() {
    return this.store.getters['chat/totalNumOfNewMessages']
  }
}

class PushNotification extends Notification {
  constructor(ctx) {
    super(ctx)
    this.tag = null
  }

  get messageBody() {
    let message
    if (this.lastUnread.type === 'reaction') {
      const emoji = this.lastUnread.asset.react_message
      message = `${this.i18n.t('chats.partner_reacted')} ${emoji}`
    } else if (this.lastUnread.type !== 'message') {
      message = `${this.i18n.t('chats.received_label')} ${currency(
        this.lastUnread.amount,
        this.lastUnread.type
      )}`
    } else {
      message = this.lastUnread.message
    }
    const processedMessage = this.store.state.options.formatMessages
      ? removeFormats(message)
      : message
    return `${this.partnerIdentity}: ${processedMessage}`
  }

  increaseCounter() {
    this.store.commit('notification/increaseDesktopActivateClickCount')
  }

  notify(messageArrived) {
    try {
      Notify.requestPermission(
        // Permission granted
        () => {
          if (messageArrived && this.tabHidden) {
            if (this.lastUnread) {
              const tag = this.lastUnread.id
              // Message not shown yet
              if (tag !== this.tag) {
                const notification = new Notify(this.i18n.t('app_title'), {
                  body: this.messageBody,
                  closeOnClick: true,
                  icon: '/img/icons/android-chrome-192x192.png',
                  notifyClick: () => {
                    if (_this.$route.name !== 'Chat') {
                      this.router.push({
                        name: 'Chat',
                        params: { partnerId: this.partnerAddress }
                      })
                    } else this.increaseCounter()
                    window.focus()
                  },
                  tag,
                  timeout: 5
                })
                notification.show()
                this.tag = tag
              }
            }
          }
        },
        // Permission denied
        () => {
          this.store.dispatch('snackbar/show', {
            message: this.i18n.t('options.push_denied')
          })
          this.store.commit('options/updateOption', {
            key: 'allowPushNotifications',
            value: false
          })
        }
      )
    } catch (x) {
      // Notification API not supported or another error
      console.error(x)
      this.store.dispatch('snackbar/show', {
        message: this.i18n.t('options.push_not_supported')
      })
      this.store.commit('options/updateOption', {
        key: 'allowPushNotifications',
        value: false
      })
    }
  }
}

class SoundNotification extends Notification {
  constructor(ctx) {
    super(ctx)
    this.audio = new Audio('/sound/bbpro_link.mp3')
  }

  notify(messageArrived) {
    if (messageArrived && this.lastUnread) {
      this.audio.play()
    }
  }
}

class TabNotification extends Notification {
  constructor(ctx) {
    super(ctx)
    this.showAmount = true
  }

  notify() {
    if (this.unreadAmount > 0 && this.lastUnread && this.tabHidden) {
      if (!this.interval) {
        this.showAmount = true
        this.start()
      }
    }
  }

  start() {
    this.interval = window.setInterval(() => {
      if (this.unreadAmount && this.showAmount) {
        if (this.unreadAmount < 100) {
          document.title = this.i18n.t('notifications.tabMessage.few', this.unreadAmount)
        } else {
          document.title = this.i18n.t('notifications.tabMessage.many')
        }
      } else {
        this.stop()
      }
      this.showAmount = !this.showAmount
    }, 1e3)
  }

  stop() {
    if (this.interval) {
      window.clearInterval(this.interval)
      this.interval = null
      document.title = this.i18n.t('app_title')
    }
  }
}

export default class extends Notification {
  constructor(ctx) {
    super(ctx)
    this.prevAmount = 0
    this.push = new PushNotification(ctx)
    this.sound = new SoundNotification(ctx)
    this.tab = new TabNotification(ctx)
  }

  // Returns true once message arrived
  get messageArrived() {
    return this.unreadAmount > this.prevAmount
  }

  start() {
    this.interval = window.setInterval(() => {
      if (this.pushAllowed) {
        this.push.notify(this.messageArrived)
      }
      if (this.soundAllowed) {
        this.sound.notify(this.messageArrived)
      }
      if (this.tabAllowed) {
        this.tab.notify()
      }
      this.prevAmount = this.unreadAmount
    }, 3e3)
  }

  stop() {
    if (this.interval) {
      window.clearInterval(this.interval)
      this.interval = null
      this.tab.stop()
    }
  }
}
