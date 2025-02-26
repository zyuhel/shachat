export default {
  useFastestAdmNode(state, value) {
    state.useFastestAdmNode = value
  },
  useFastestCoinNode(state, value) {
    state.useFastestCoinNode = value
  },
  useFastestIpfsNode(state, value) {
    state.useFastestIpfsNode = value
  },

  toggle(state, payload) {
    const node = state[payload.type][payload.url]
    if (node) {
      node.active = payload.active
    }
  },

  status(state, { status, nodeType }) {
    state[nodeType][status.url] = status
  }
}
