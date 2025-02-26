import { nodes } from '@/lib/nodes'

export default {
  updateStatus() {
    for (const [, client] of Object.entries(nodes)) {
      client.checkHealth()
    }
  },

  toggle(context, payload) {
    context.commit('toggle', payload)
  },

  toggleAll(context, payload) {
    const { nodesType, active } = payload
    const nodes = context.getters[nodesType]
    for (const node of Object.values(nodes)) {
      const { type, url } = node
      context.commit('toggle', { type, url, active })
    }
  },

  setUseFastestAdmNode(context, payload) {
    context.commit('useFastestAdmNode', payload)
  },
  setUseFastestCoinNode(context, payload) {
    context.commit('useFastestCoinNode', payload)
  },
  setUseFastestIpfsNode(context, payload) {
    context.commit('useFastestIpfsNode', payload)
  }
}
