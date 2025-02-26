<template>
  <NodesTableContainer>
    <NodesTableHead v-model="isAllNodesChecked" :indeterminate="isPartiallyChecked" />

    <tbody>
      <AdmNodesTableItem v-for="node in admNodes" :key="node.url" blockchain="adm" :node="node" />
    </tbody>
  </NodesTableContainer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import NodesTableContainer from '@/components/nodes/components/NodesTableContainer.vue'
import NodesTableHead from '@/components/nodes/components/NodesTableHead.vue'
import AdmNodesTableItem from './AdmNodesTableItem.vue'
import { sortNodesFn } from '@/components/nodes/utils/sortNodesFn'

const className = 'adm-nodes-table'
const classes = {
  root: className
}

export default defineComponent({
  components: {
    NodesTableContainer,
    NodesTableHead,
    AdmNodesTableItem
  },
  setup() {
    const store = useStore()

    const admNodes = computed(() => {
      const arr = store.getters['nodes/adm']

      return [...arr].sort(sortNodesFn)
    })

    const isAllNodesChecked = computed({
      get() {
        return admNodes.value.every(node => node.active)
      },
      set(value) {
        store.dispatch('nodes/toggleAll', { nodesType: 'adm', active: value })
      }
    })

    const isPartiallyChecked = computed(() => {
      return admNodes.value.some(node => node.active) && admNodes.value.some(node => !node.active)
    })

    return {
      admNodes,
      classes,
      isAllNodesChecked,
      isPartiallyChecked
    }
  }
})
</script>

<style lang="scss"></style>
