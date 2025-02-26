<template>
  <NodesTableContainer>
    <NodesTableHead
      v-model="isAllNodesChecked"
      :indeterminate="isPartiallyChecked"
      hide-label
      hide-socket
    />

    <tbody>
      <IpfsNodesTableItem v-for="node in ipfsNodes" :key="node.url" blockchain="adm" :node="node" />
    </tbody>
  </NodesTableContainer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import NodesTableContainer from '@/components/nodes/components/NodesTableContainer.vue'
import NodesTableHead from '@/components/nodes/components/NodesTableHead.vue'
import IpfsNodesTableItem from './IpfsNodesTableItem.vue'
import { type NodeStatusResult } from '@/lib/nodes/abstract.node'
import { sortNodesFn } from '@/components/nodes/utils/sortNodesFn'

const className = 'ipfs-nodes-table'
const classes = {
  root: className
}

export default defineComponent({
  components: {
    NodesTableContainer,
    NodesTableHead,
    IpfsNodesTableItem
  },
  setup() {
    const store = useStore()
    const ipfsNodes = computed(() => {
      const arr = store.getters['nodes/ipfs']

      return [...arr].sort(sortNodesFn)
    })

    const nodes = computed<NodeStatusResult[]>(() => {
      const arr = store.getters['nodes/ipfs']

      return [...arr].sort(sortNodesFn)
    })

    const isAllNodesChecked = computed({
      get() {
        return nodes.value.every((node) => node.active)
      },
      set(value) {
        store.dispatch('nodes/toggleAll', { nodesType: 'ipfs', active: value })
      }
    })

    const isPartiallyChecked = computed(() => {
      return nodes.value.some((node) => node.active) && nodes.value.some((node) => !node.active)
    })

    return {
      ipfsNodes,
      classes,
      isAllNodesChecked,
      isPartiallyChecked
    }
  }
})
</script>

<style lang="scss">
@import 'vuetify/settings';
</style>
