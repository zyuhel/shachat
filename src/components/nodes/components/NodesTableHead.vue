<template>
  <thead :class="classes.root">
    <tr>
      <th :class="classes.checkbox" v-if="!hideCheckbox">
        <NodeStatusCheckbox v-model="isAllEnabled" :indeterminate="indeterminate"/>
      </th>
      <th :class="classes.label" class="pl-0 pr-2" v-if="label">
        {{ label }}
      </th>
      <th :class="classes.th" class="pl-0 pr-2" v-if="!hideHost">
        {{ t('nodes.host') }}
      </th>
      <th :class="classes.th" class="pl-0 pr-2" v-if="!hidePing">
        {{ t('nodes.ping') }}
      </th>
      <th :class="classes.th" class="pl-0 pr-2" v-if="!hideSocket">
        {{ t('nodes.socket') }}
      </th>
    </tr>
  </thead>
</template>

<script>
import { computed } from 'vue'
import NodeStatusCheckbox from './NodeStatusCheckbox.vue'
import { useI18n } from 'vue-i18n'

const className = 'nodes-table-head'
const classes = {
  root: className,
  th: `${className}__th`,
  checkbox: `${className}__checkbox`,
  label: `${className}__label`
}

export default {
  components: {
    NodeStatusCheckbox
  },
  props: {
    modelValue: {
      type: Boolean,
    },
    hideCheckbox: {
      type: Boolean
    },
    hideHost: {
      type: Boolean
    },
    hidePing: {
      type: Boolean
    },
    hideSocket: {
      type: Boolean
    },
    label: {
      type: String
    },
    indeterminate: {
      type: Boolean
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    
    const isAllEnabled = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })
    
    return {
      classes,
      t,
      isAllEnabled
    }
  }
}
</script>

<style lang="scss">
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.nodes-table-head {
  &__th {
    font-size: 12px;
  }

  &__checkbox {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  &__label {
    font-size: 12px;
    width: 104px;
  }
}

/** Themes **/
.v-theme--light {
  .nodes-table-head {
    &__th, &__label {
      color: map-get($adm-colors, 'regular');
    }
  }
}
.v-theme--dark {
  .nodes-table-head {
    &__th, &__label {
      color: map-get($adm-colors, 'white');
    }
  }
}
</style>
