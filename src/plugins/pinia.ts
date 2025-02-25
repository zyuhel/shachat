import { createPinia, defineStore, getActivePinia } from 'pinia'

export const pinia = createPinia()

export function resetPinia() {
  const activePinia = getActivePinia()
  if (activePinia) {
    Object.entries(activePinia.state.value).forEach(([storeName, state]) => {
      const storeDefinition = defineStore(storeName, state)
      const store = storeDefinition(activePinia)
      store.$reset()
      console.info(`[Pinia] The "${storeName}" store has been reset`)
    })
  }
}
