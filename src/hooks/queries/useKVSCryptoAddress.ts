import { computed, ComputedRef, unref } from 'vue'
import { useStore } from 'vuex'
import { useQuery } from '@tanstack/vue-query'
import { CryptoSymbol } from '@/lib/constants'

export function useKVSCryptoAddress(
  admAddress: ComputedRef<string | undefined>,
  crypto: CryptoSymbol
) {
  const store = useStore()

  const fetchCryptoAddress = (): Promise<string> =>
    store.dispatch('partners/fetchAddress', {
      crypto,
      partner: admAddress
    })

  const isEnabled = computed(() => !!admAddress.value)

  const { data } = useQuery({
    queryKey: ['KVS', unref(crypto), admAddress],
    queryFn: fetchCryptoAddress,
    enabled: isEnabled
  })

  return computed(() => data.value)
}