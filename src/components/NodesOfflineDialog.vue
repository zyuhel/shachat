<template>
  <v-dialog v-model="showDialog" width="500" :class="className">
    <v-card>
      <v-card-title :class="`${className}__card-title a-text-header`">
        {{ t('chats.nodes_offline_dialog.title', { coin: nodeType.toUpperCase() }) }}
      </v-card-title>

      <v-divider class="a-divider" />

      <v-card-text :class="`${className}__card-text`">
        <div
          :class="`${className}__disclaimer a-text-regular-enlarged`"
          v-html="t('chats.nodes_offline_dialog.text', { coin: nodeType.toUpperCase() })"
        ></div>
      </v-card-text>

      <v-col cols="12" :class="[`${className}__btn-block`, 'text-center']">
        <v-btn
          @click="showDialog = false"
          :class="[`${className}__btn-free-tokens`, 'a-btn-primary']"
          to="/options/nodes"
          variant="text"
          :prepend-icon="mdiOpenInNew"
        >
          <div :class="`${className}__btn-text`">
            {{ t('chats.nodes_offline_dialog.open_nodes_button') }}
          </div>
        </v-btn>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { NodeType } from '@/lib/nodes/types'
import { mdiOpenInNew } from '@mdi/js'

const className = 'all-nodes-disabled-dialog'
const classes = {
  root: className
}

export default {
  props: {
    nodeType: {
      type: String as PropType<NodeType>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup() {
    const { t } = useI18n()
    const store = useStore()

    const showDialog = computed({
      get() {
        return store.state.chat.noActiveNodesDialog
      },
      set() {
        store.commit('chat/setNoActiveNodesDialog', false)
      }
    })

    return {
      t,
      classes,
      showDialog,
      className,
      mdiOpenInNew
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'vuetify/_settings.scss';
@import '@/assets/styles/settings/_colors.scss';

.all-nodes-disabled-dialog {
  &__card-title {
  }
  &__card-text {
    padding: 16px !important;
  }
  &__btn {
    margin-top: 15px;
    margin-bottom: 20px;
  }
  &__btn-icon {
    margin-right: 8px;
  }
  &__btn-block {
    padding: 12px 0 24px 0;
    text-align: center;
  }
}

.v-theme--dark {
  .all-nodes-disabled-dialog {
    &__disclaimer {
      color: map-get($shades, 'white');
    }
  }
}
</style>
