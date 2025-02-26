<script lang="ts">
import { computed, type ComputedRef, defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'

function useUploadAttachmentExitPrompt() {
  const store = useStore()
  const isUploadInProgress = computed(
    () => store.getters['attachment/isUploadInProgress'] as ComputedRef<boolean>
  )

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isUploadInProgress.value) {
      event.preventDefault()
      event.returnValue =
        'Files are currently uploading. Are you sure you want to interrupt the process?' // The prompt message cannot be customized in modern browsers
    }
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return isUploadInProgress
}

export default defineComponent({
  setup() {
    const isUploadInProgress = useUploadAttachmentExitPrompt()

    return {
      isUploadInProgress
    }
  }
})
</script>
