<template>
  <NodesTableContainer>
    <NodesTableHead 
      v-model="isAllNodesChecked" 
      :indeterminate="isPartiallyChecked" 
      hide-socket 
      :label="t('nodes.service')"
    />
    
    <tbody>
      <ServiceNodesTableItem
        v-for="node in nodes"
        :key="node.url"
        :label="node.label"
        :node="node"
      />
    </tbody>
  </NodesTableContainer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import NodesTableContainer from '@/components/nodes/components/NodesTableContainer.vue'
import NodesTableHead from '@/components/nodes/components/NodesTableHead.vue'
import ServiceNodesTableItem from './ServiceNodesTableItem.vue'
import { type NodeStatusResult } from '@/lib/nodes/abstract.node'
import { sortCoinNodesFn } from '@/components/nodes/utils/sortNodesFn'

const className = 'nodes-table'
const classes = {
  root: className
}

export default defineComponent({
  components: {
    NodesTableContainer,
    NodesTableHead,
    ServiceNodesTableItem
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()

    const nodes = computed<NodeStatusResult[]>(() => {
      const arr = store.getters['services/services']

      return [...arr].sort(sortCoinNodesFn)
    })

    const isAllNodesChecked = computed({
      get() {
        return nodes.value.every(node => node.active)
      },
      set(value) {
        store.dispatch('services/toggleAll', {active: value})
      }
    })

    const isPartiallyChecked = computed(() => {
      return nodes.value.some(node => node.active) && nodes.value.some(node => !node.active)
    })

    return {
      t,
      nodes,
      classes,
      isAllNodesChecked,
      isPartiallyChecked
    }
  }
})
</script>

<style lang="scss" scoped></style>
