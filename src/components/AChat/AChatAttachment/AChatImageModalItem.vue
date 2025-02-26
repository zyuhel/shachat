<template>
  <v-carousel-item :class="classes.root" :src="imageUrl" :max-width="width" :max-height="height" />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

import { NormalizedChatMessageTransaction } from '@/lib/chat/helpers'
import { FileAsset } from '@/lib/adamant-api/asset'

const className = 'a-chat-image-modal-item'
const classes = {
  root: className
}

export default defineComponent({
  props: {
    file: {
      type: Object as PropType<FileAsset>,
      required: true
    },
    transaction: {
      type: Object as PropType<NormalizedChatMessageTransaction>,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const imageUrl = ref('')

    const width = computed(() => props.file.resolution?.[0])
    const height = computed(() => props.file.resolution?.[1])
    const publicKey = computed(() =>
      props.transaction.senderId === store.state.address
        ? props.transaction.recipientPublicKey
        : props.transaction.senderPublicKey
    )

    const getFileFromStorage = async () => {
      const { id, nonce } = props.file

      imageUrl.value = await store.dispatch('attachment/getAttachmentUrl', {
        cid: id,
        publicKey: publicKey.value,
        nonce
      })
    }

    onMounted(() => {
      getFileFromStorage()
    })

    return {
      classes,
      getFileFromStorage,
      imageUrl,
      width,
      height
    }
  }
})
</script>

<style scoped>
.a-chat-image-modal-item {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
