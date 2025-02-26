<template>
  <tr :class="classes.root">
    <NodeColumn checkbox>
      <NodeStatusCheckbox :value="active" @change="toggleActiveStatus" />
    </NodeColumn>

    <NodeColumn>
      <NodeUrl :node="node" />
      <NodeVersion v-if="node.version && active" :node="node" />
    </NodeColumn>

    <NodeColumn :class="classes.columnStatus">
      <NodeStatus :node="node" />
    </NodeColumn>

    <NodeColumn>
      <SocketSupport v-if="showSocketColumn" :node="node" />
    </NodeColumn>
  </tr>
</template>

<script lang="ts">
import { computed, PropType } from 'vue'
import { useStore } from 'vuex'
import type { NodeStatusResult } from '@/lib/nodes/abstract.node'
import NodeUrl from '@/components/nodes/components/NodeUrl.vue'
import NodeColumn from '@/components/nodes/components/NodeColumn.vue'
import NodeStatus from '@/components/nodes/components/NodeStatus.vue'
import NodeVersion from '@/components/nodes/components/NodeVersion.vue'
import SocketSupport from '@/components/nodes/components/SocketSupport.vue'
import NodeStatusCheckbox from '@/components/nodes/components/NodeStatusCheckbox.vue'

const className = 'amd-nodes-table-item'
const classes = {
  root: className,
  column: `${className}__column`,
  columnStatus: `${className}__column--status`,
  columnCheckbox: `${className}__column--checkbox`,
  checkbox: `${className}__checkbox`
}

export default {
  components: {
    NodeStatusCheckbox,
    NodeColumn,
    NodeStatus,
    NodeVersion,
    SocketSupport,
    NodeUrl
  },
  props: {
    node: {
      type: Object as PropType<NodeStatusResult>,
      required: true
    }
  },
  setup(props) {
    const store = useStore()

    const url = computed(() => props.node.url)
    const active = computed(() => props.node.active)
    const socketSupport = computed(() => props.node.socketSupport)
    const isUnsupported = computed(() => props.node.status === 'unsupported_version')
    const type = computed(() => props.node.type)
    const showSocketColumn = computed(() => active.value && !isUnsupported.value)

    const toggleActiveStatus = () => {
      store.dispatch('nodes/toggle', {
        type: type.value,
        url: url.value,
        active: !active.value
      })
      store.dispatch('nodes/updateStatus')
    }

    const computedResult = computed(() => {
      const baseUrl = new URL(url.value)
      const protocol = baseUrl.protocol
      const hostname = baseUrl.hostname
      const port = baseUrl.port
      const result = /^[\d.]+$/.test(hostname)

      let nodeName = null
      let domain = null

      if (result === false) {
        const regex = /([^.]*)\.(.*)/
        const parts = hostname.match(regex)
        if (parts !== null) {
          nodeName = parts[1]
          domain = parts[2]
        }
      }

      return {
        protocol,
        hostname,
        nodeName,
        domain,
        result,
        port
      }
    })

    return {
      classes,
      url,
      active,
      socketSupport,
      isUnsupported,
      showSocketColumn,
      toggleActiveStatus,
      computedResult
    }
  }
}
</script>

<style lang="scss">
.amd-nodes-table-item {
  line-height: 14px;
  
  &__column--status {
    max-width: 84px;
  }
}
</style>
