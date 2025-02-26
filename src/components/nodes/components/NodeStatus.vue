<template>
  <div :class="classes.statusTitle">
    <span>
      {{ nodeStatusTitle
      }}<span v-if="node.status === 'online'" :class="classes.textMs">{{
        t('nodes.ms')
      }}</span></span
    >

    <v-icon
      :class="{
        [classes.icon]: true,
        [classes.iconGreen]: nodeStatusColor === 'green',
        [classes.iconRed]: nodeStatusColor === 'red',
        [classes.iconOrange]: nodeStatusColor === 'orange',
        [classes.iconGrey]: nodeStatusColor === 'grey'
      }"
      :color="nodeStatusColor"
      :icon="mdiCheckboxBlankCircle"
      size="small"
    />
  </div>

  <span v-if="nodeStatusDetail && node.status !== 'sync'" :class="classes.statusText">
    <v-icon v-if="nodeStatusDetail.icon" :icon="nodeStatusDetail.icon" :size="12" />
    {{ nodeStatusDetail.text }}
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { NodeStatusResult } from '@/lib/nodes/abstract.node'
import { useNodeStatus } from '@/components/nodes/hooks'
import { mdiCheckboxBlankCircle } from '@mdi/js'


const className = 'node-status'
const classes = {
  textMs: `${className}__text-ms`,
  statusTitle: `${className}__status-title`,
  statusText: `${className}__status-text`,
  icon: `${className}__icon`,
  iconGreen: `${className}__icon--green`,
  iconRed: `${className}__icon--red`,
  iconOrange: `${className}__icon--orange`,
  iconGrey: `${className}__icon--grey`
}

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<NodeStatusResult>,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n()
    const { node } = toRefs(props)

    const { nodeStatusTitle, nodeStatusDetail, nodeStatusColor } = useNodeStatus(node)

    return {
      t,
      nodeStatusTitle,
      nodeStatusDetail,
      nodeStatusColor,
      classes,
      mdiCheckboxBlankCircle
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';
@import '@/assets/styles/themes/adamant/_mixins.scss';

.node-status {
  &__status-title {
    width: 76px;
    max-width: 80px;
    display: flex;
  }

  &__status-text {
    font-size: 12px;
    font-weight: 300;
  }

  &__icon {
    margin-inline-start: 4px;
  }
  &__text-ms {
    @include a-text-explanation-small();
  }
}

.v-theme--light {
  .node-status {
    &__status-text {
      color: map-get($adm-colors, 'regular');
    }
    &__text-ms {
      color: map-get($adm-colors, 'muted');
    }

    &__icon {
      &--green {
        color: map-get($adm-colors, 'good') !important;
      }
      &--red {
        color: map-get($adm-colors, 'danger') !important;
      }
      &--grey {
        color: map-get($adm-colors, 'grey') !important;
      }
      &--orange {
        color: map-get($adm-colors, 'attention') !important;
      }
    }
  }
}

.v-theme--dark {
  .node-status {
    &__status-text {
      color: map-get($shades, 'white');
      opacity: 0.7;
    }
    &__text-ms {
      color: map-get($adm-colors, 'grey-transparent');
    }
    &__icon {
      &--green {
        color: map-get($adm-colors, 'good') !important;
      }
      &--red {
        color: map-get($adm-colors, 'danger') !important;
      }
      &--grey {
        color: map-get($adm-colors, 'grey') !important;
      }
      &--orange {
        color: map-get($adm-colors, 'attention') !important;
      }
    }
  }
}
</style>
