import { services } from '@/lib/nodes/services'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServicesState, TogglePayload, ToggleAllPayload, Node } from '@/store/modules/services/types'

export const actions: ActionTree<ServicesState, RootState> = {
  updateStatus() {
    for (const [, client] of Object.entries(services)) {
      client.checkHealth()
    }
  },

  toggle(context, payload: TogglePayload) {
    context.commit('toggle', payload)
  },

  toggleAll(context, payload: ToggleAllPayload) {
    const { active } = payload
    const nodes = context.getters['services']
    for (const node of Object.values(nodes)) {
      const { label, url } = node as Node
      context.commit('toggle', { type: label, url, active })
    }
  },

  useFastestService(context, payload: boolean) {
    context.commit('useFastestService', payload)
  }
}
