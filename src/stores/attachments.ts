import { ref } from 'vue'
import { defineStore } from 'pinia'

import { FileData } from '@/lib/files'
import { UPLOAD_MAX_FILE_COUNT, UPLOAD_MAX_FILE_SIZE } from '@/lib/constants'

export const useAttachments = (admAddress: string) =>
  defineStore(`attachments-${admAddress}`, () => {
    const list = ref<FileData[]>([])

    const add = (filesList: FileData[]) => {
      list.value = [...list.value, ...filesList]
        .filter((file) => file.file.size < UPLOAD_MAX_FILE_SIZE)
        .slice(0, UPLOAD_MAX_FILE_COUNT)
    }

    const remove = (index: number) => {
      list.value = list.value.filter((_, i) => i !== index)
    }

    const $reset = () => {
      list.value = []
    }

    return {
      list,
      $reset,
      add,
      remove
    }
  })
