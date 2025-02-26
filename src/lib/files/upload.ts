import { FileData } from './types'
import ipfs from '@/lib/nodes/ipfs'

export async function uploadFiles(
  files: FileData[],
  onUploadProgress?: (progress: number) => void
) {
  const formData = new FormData()

  for (const file of files) {
    const blob = new Blob([file.encoded.binary], { type: 'application/octet-stream' })
    formData.append('files', blob, file.file.name)

    if (file.preview) {
      const blob = new Blob([file.preview.encoded.binary], { type: 'application/octet-stream' })
      formData.append('files', blob, 'preview-' + file.file.name)
    }
  }

  onUploadProgress?.(0) // set initial progress to 0
  const response = await ipfs.upload(formData, (progress) => {
    const percentCompleted = Math.round((progress.loaded * 100) / (progress.total || 0))

    onUploadProgress?.(percentCompleted)
  })

  return response
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      resolve(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
}

export function readFileAsBuffer(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      // Convert the ArrayBuffer to a Uint8Array
      const arrayBuffer = reader.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)
      resolve(uint8Array)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsArrayBuffer(file)
  })
}
