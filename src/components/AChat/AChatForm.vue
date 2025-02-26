<template>
  <div :class="classes">
    <v-divider v-if="showDivider" class="a-chat__divider" />

    <slot name="reply-preview" />
    <slot name="preview-file" />

    <v-textarea
      ref="messageTextarea"
      v-model="message"
      @input="onInput"
      :placeholder="label"
      hide-details
      single-line
      auto-grow
      rows="1"
      max-rows="10"
      variant="underlined"
      density="compact"
      base-color="primary"
      color="primary"
      v-on="listeners"
      :autofocus="isDesktopDevice"
      @focusin="isInputFocused = true"
      @focusout="isInputFocused = false"
    >
      <template #prepend-inner>
        <chat-emojis
          @keydown.capture.esc="closeElement"
          :open="emojiPickerOpen"
          @onChange="onToggleEmojiPicker"
          @get-emoji-picture="emojiPicture"
        ></chat-emojis>
      </template>
      <template v-if="showSendButton" #append-inner>
        <slot name="append" />
        <v-icon class="a-chat__send-icon" :icon="mdiSend" size="28" />
      </template>
    </v-textarea>

    <div v-if="showSendButton" class="a-chat__form-send-area" @click="submitMessage" />
  </div>
</template>

<script>
import { nextTick } from 'vue'
import ChatEmojis from '@/components/Chat/ChatEmojis.vue'
import { isMobile } from '@/lib/display-mobile'
import { mdiSend } from '@mdi/js'

export default {
  components: { ChatEmojis },
  props: {
    partnerId: {
      default: '',
      type: String
    },
    messageText: {
      default: '',
      type: String
    },
    showSendButton: {
      type: Boolean,
      default: true
    },
    sendOnEnter: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: 'Type a message'
    },
    showDivider: {
      type: Boolean,
      default: false
    },
    /**
     * Message validator.
     */
    validator: {
      type: Function,
      required: true
    }
  },
  emits: ['message', 'esc', 'error'],
  setup() {

    return {
      mdiSend
    }
  },
  data: () => ({
    message: '',
    emojiPickerOpen: false,
    botCommandIndex: null,
    botCommandSelectionMode: false,
    isInputFocused: false
  }),
  computed: {
    isDesktopDevice: () => !isMobile(),
    className: () => 'a-chat',
    classes() {
      return [
        `${this.className}__form`,
        {
          [`${this.className}__form--is-active`]: !!this.message
        }
      ]
    },
    /**
     * Processing `ctrl+enter`, `shift + enter` and `enter`
     */
    listeners() {
      return {
        keypress: (e) => {
          // on some devices keyCode for CTRL+ENTER is 10
          // https://bugs.chromium.org/p/chromium/issues/detail?id=79407
          if (e.keyCode === 13 || e.keyCode === 10) {
            // Enter || Ctrl+Enter
            if (this.sendOnEnter) {
              // add LF and calculate height when CTRL+ENTER or ALT+ENTER or CMD+ENTER (Mac & Windows)
              // no need to add LF for shiftKey, it will be added automatically
              if (e.ctrlKey || e.altKey || e.metaKey) {
                this.addLineFeed()
                this.calculateInputHeight()
                return
              }

              if (!e.shiftKey) {
                // send message if shiftKey is not pressed
                e.preventDefault()
                this.submitMessage()
              }
            } else {
              if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                e.preventDefault()
                this.submitMessage()
              }
            }
          }
        },
        keydown: (e) => {
          if (e.code === 'Escape') {
            this.$emit('esc')
          }
        }
      }
    }
  },
  mounted() {
    if (this.messageText) {
      this.message = this.messageText
      this.focus()
    }
    this.attachKeyCommandListener()
  },
  beforeUnmount() {
    this.destroyKeyCommandListener()
  },
  methods: {
    attachKeyCommandListener() {
      window.addEventListener('keydown', this.onKeyCommand)
    },
    destroyKeyCommandListener() {
      window.removeEventListener('keydown', this.onKeyCommand)
    },
    onKeyCommand: function (event) {
      if (event.ctrlKey && event.shiftKey && event.code === 'Digit1') {
        this.openElement()
      } else if (this.isInputFocused && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
        this.selectCommand(event)
      } else if (event.key.length === 1) {
        this.botCommandSelectionMode = false
        this.botCommandIndex = null
      }
    },
    openElement() {
      this.emojiPickerOpen = true
    },
    closeElement() {
      this.emojiPickerOpen = false
      setTimeout(() => this.focus(), 0)
    },
    onInput: function () {
      this.$store.commit('draftMessage/saveMessage', {
        message: this.message,
        partnerId: this.partnerId
      })
    },
    emojiPicture(emoji) {
      const caretPosition = this.$refs.messageTextarea.selectionStart

      let before = this.message.slice(0, caretPosition)
      const after = this.message.slice(caretPosition)
      let emojiLength = emoji.length

      if (
        (before.length > 0 &&
          !/\s|[[{(\n]/.test(before.slice(-1)) && // Check for a space, newline or parentheses before the emoji
          !before
            .slice(-2)
            .match(
              /[\p{Emoji_Presentation}\p{Emoji}\p{Emoji_Modifier_Base}\p{Emoji_Component}]/gu
            )) ||
        /[\d]/.test(before.slice(-1))
      ) {
        before += ' '
        emojiLength += 1
      }
      this.message = before + emoji + after
      this.closeElement()

      // Set the cursor position to after the newly inserted text
      const newCaretPosition = caretPosition + emojiLength
      this.focus()
      this.$nextTick(() => {
        this.$refs.messageTextarea.setSelectionRange(newCaretPosition, newCaretPosition)
      })
      this.onInput()
    },

    onToggleEmojiPicker(state) {
      this.emojiPickerOpen = state

      this.focus()
    },

    submitMessage() {
      const error = this.validator(this.message)
      if (error === false) {
        if (this.message.startsWith('/')) {
          this.$store.commit('botCommands/addCommand', {
            partnerId: this.partnerId,
            command: this.message.trim(),
            timestamp: Date.now()
          })
        }
        this.$emit('message', this.message)
        this.message = ''
        this.$store.commit('draftMessage/deleteMessage', {
          message: this.message,
          partnerId: this.partnerId
        })
        this.botCommandIndex = null
        this.botCommandSelectionMode = false
      } else {
        this.$emit('error', error)
      }

      // Fix textarea height to 1 row after miltiline message send
      this.calculateInputHeight()
      this.focus()
    },
    calculateInputHeight() {
      nextTick(this.$refs.messageTextarea.calculateInputHeight)
    },
    addLineFeed() {
      this.message += '\n'
    },
    focus() {
      this.$refs.messageTextarea.focus()
    },
    selectCommand(event) {
      const direction = event.code
      if (!this.message) {
        this.botCommandSelectionMode = true
      }
      if (!this.botCommandSelectionMode) {
        return
      }
      event.preventDefault()
      const commands = this.$store.getters['botCommands/getCommandsHistory'](this.partnerId)
      const maxIndex = commands.length > 0 ? commands.length - 1 : 0
      if (this.botCommandIndex === null) {
        if (direction === 'ArrowUp') {
          this.botCommandIndex = maxIndex
          this.message = commands[this.botCommandIndex]?.command || ''
        }
        return
      }

      if (direction === 'ArrowUp') {
        if (this.botCommandIndex > 0) {
          this.botCommandIndex--
          this.message = commands[this.botCommandIndex]?.command || ''
        }
        return
      }

      if (this.botCommandIndex < maxIndex) {
        this.botCommandIndex++
        this.message = commands[this.botCommandIndex]?.command || ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

/**
 * 1. Limit height of message form.
 * 2. Align icons at the bottom.
 */
.a-chat__form {
  :deep(.v-text-field__slot) textarea {
    max-height: 230px;
    overflow-y: auto;
  }
  :deep(.v-text-field) {
    align-items: flex-end;
  }
  :deep(.v-textarea) {
    .v-input__prepend {
      margin-bottom: 2px;
      margin-inline-end: 9px;
      padding-top: 0;
    }
    .v-field__append-inner,
    .v-field__prepend-inner {
      margin-top: auto;
      padding-top: 0;
      margin-bottom: 4px;
    }
    .v-field__prepend-inner > .v-icon,
    .v-field__append-inner > .v-icon,
    .v-field__clearable > .v-icon {
      --v-medium-emphasis-opacity: 1;
    }
    .v-input__control {
      margin-bottom: 2px;
    }
    .v-field__input {
      &::placeholder {
        --v-disabled-opacity: 1;
      }
    }
  }
}

.a-chat__divider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.a-chat__form-send-area {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  cursor: pointer;
}

.v-theme--light {
  .a-chat__form {
    :deep(.v-textarea) {
      .v-field__input {
        caret-color: map-get($adm-colors, 'primary');

        &::placeholder {
          color: map-get($adm-colors, 'muted');
        }
      }
    }
  }
}

.v-theme--dark {
  .a-chat__form {
    :deep(.v-textarea) {
      .v-field__input {
        caret-color: map-get($adm-colors, 'primary');

        &::placeholder {
          color: rgba(map-get($shades, 'white'), 70%);
        }
      }
    }
  }
}
</style>
