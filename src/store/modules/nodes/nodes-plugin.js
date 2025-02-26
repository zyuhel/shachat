import { nodes } from '@/lib/nodes'

export default (store) => {
  for (const [nodeType, client] of Object.entries(nodes)) {
    client.getNodes().forEach((status) => store.commit('nodes/status', { status, nodeType }))

    client.onStatusUpdate((status) => {
      store.commit('nodes/status', { status, nodeType })
    })
  }
  store.commit('nodes/useFastestAdmNode', nodes.adm.useFastest)
  store.commit('nodes/useFastestCoinNode', nodes.btc.useFastest)
  store.commit('nodes/useFastestIpfsNode', nodes.ipfs.useFastest)

  store.subscribe((mutation) => {
    const { type, payload } = mutation

    if (type === 'nodes/useFastestAdmNode') {
      nodes.adm.setUseFastest(!!payload)
    }

    if (type === 'nodes/useFastestCoinNode') {
      nodes.btc.setUseFastest(!!payload)
      nodes.dash.setUseFastest(!!payload)
      nodes.doge.setUseFastest(!!payload)
      nodes.eth.setUseFastest(!!payload)
      nodes.kly.setUseFastest(!!payload)
    }

    if (type === 'nodes/useFastestIpfsNode') {
      nodes.ipfs.setUseFastest(!!payload)
    }

    if (type === 'nodes/toggle') {
      const selectedNodeType = payload.type
      const newStatus = nodes[selectedNodeType].toggleNode(payload.url, payload.active)

      if (newStatus) {
        store.commit('nodes/status', { status: newStatus, nodeType: selectedNodeType })
      }
    }
  })
}
