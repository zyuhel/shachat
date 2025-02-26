import { encodeFile } from '@/lib/adamant-api'
import { watch } from 'vue'
import ipfs from '@/lib/nodes/ipfs'
import { useMutation } from '@tanstack/vue-query'

type ParsedFile = { file: File; binary: Buffer | Uint8Array }

export async function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer)
    }
    reader.onerror = (e) => {
      reject(e)
    }
    reader.readAsArrayBuffer(file)
  })
}

async function uploadFile(files: File[], to: string) {
  const parsedFiles: ParsedFile[] = []

  for (const file of files) {
    const binary = await readFile(file)
    const encoded = await encodeFile(new Uint8Array(binary), { to })

    parsedFiles.push({
      file,
      binary: encoded.binary
    })
  }
  console.log('Files', files)

  const formData = new FormData()

  for (const file of parsedFiles) {
    const blob = new Blob([file.binary], { type: 'application/octet-stream' })
    formData.append('files', blob, file.file.name)
  }

  const response = await ipfs.upload(formData, (progress) => {
    const percentCompleted = Math.round((progress.loaded * 100) / progress.total!)

    console.log(`Progress ${percentCompleted}%`)
  })
  console.log(`Uploaded CIDs`, response)

  return response
}

export function useUploadFile() {
  const { status, mutateAsync, mutate } = useMutation({
    mutationFn: (params: { files: File[]; to: string }) => {
      return uploadFile(params.files, params.to)
    }
  })

  watch(status, (status) => {
    console.log('Status changed', status)
  })

  return {
    mutate,
    mutateAsync,
    status
  }
}
