import { computed, defineComponent, PropType, unref } from 'vue'
import { useStore } from 'vuex'
import { useQuery } from '@tanstack/vue-query'

import { FileAsset } from '@/lib/adamant-api/asset'
import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { LocalFile, isLocalFile } from '@/lib/files'

export const AChatFileLoader = defineComponent(
  (props, { slots }) => {
    const store = useStore()
    const myAddress = computed(() => store.state.address)

    const publicKey = computed(() => {
      return props.transaction.senderId === myAddress.value
        ? props.transaction.recipientPublicKey
        : props.transaction.senderPublicKey
    })

    const width = computed(() => {
      if (isLocalFile(props.file)) {
        return props.file.file.width
      } else {
        return props.file.resolution?.[0]
      }
    })

    const height = computed(() => {
      if (isLocalFile(props.file)) {
        return props.file.file.height
      } else {
        return props.file.resolution?.[1]
      }
    })

    const { data, isLoading, error } = useQuery({
      queryKey: ['file', (props.file as FileAsset).id],
      queryFn: async () => {
        const file = props.file as FileAsset

        const fileUrl = await store.dispatch('attachment/getAttachmentUrl', {
          cid: file.id,
          publicKey: publicKey.value,
          nonce: file.nonce
        })

        return fileUrl
      },
      enabled: !isLocalFile(props.file),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    })

    const fileUrl = computed(() => {
      if (isLocalFile(props.file)) {
        return store.getters['attachment/getImageUrl'](props.file.file.cid)
      }

      return data.value
    })

    const uploadProgress = computed(() => {
      if (isLocalFile(props.file)) {
        return store.getters['attachment/getUploadProgress'](props.file.file.cid)
      }

      return 100
    })

    return () => (
      <>
        {slots.default?.({
          isLoading: unref(isLoading),
          uploadProgress: unref(uploadProgress),
          fileUrl: unref(fileUrl),
          error: unref(error),
          width: unref(width),
          height: unref(height)
        })}
      </>
    )
  },
  {
    props: {
      file: {
        type: Object as PropType<FileAsset | LocalFile>,
        required: true
      },
      partnerId: {
        type: String,
        required: true
      },
      transaction: {
        type: Object as PropType<NormalizedChatMessageTransaction>,
        required: true
      }
    }
  }
)
