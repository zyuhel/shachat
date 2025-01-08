import { FileData } from '@/components/UploadFile.vue'
import ipfs from '@/lib/nodes/ipfs'

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

/**
 * Compute CID for a file
 */
export async function computeCID(fileOrBytes: File | Uint8Array) {
  const { CID } = await import('multiformats/cid')
  const { code } = await import('multiformats/codecs/raw')
  const { sha256 } = await import('multiformats/hashes/sha2')

  const bytes =
    fileOrBytes instanceof File ? new Uint8Array(await fileOrBytes.arrayBuffer()) : fileOrBytes

  const hash = await sha256.digest(bytes)
  const cid = CID.create(1, code, hash)

  return cid.toString()
}

/**
 * Crops an image to a specific maximum width or height while maintaining its aspect ratio.
 *
 * @param imageFile - The original image file to be cropped.
 * @param maxSize - The maximum width or height of the cropped image.
 * @returns A new File object with the cropped image.
 */
export async function cropImage(imageFile: File, maxSize = 500): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!imageFile.type.startsWith('image/')) {
      reject(new Error('Provided file is not an image'))
      return
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Define max size
      let width = img.width
      let height = img.height

      // Calculate new dimensions while keeping aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height
          height = maxSize
        }
      }

      // Set canvas to the new calculated dimensions
      canvas.width = width
      canvas.height = height

      // Draw the resized image on the canvas
      ctx!.drawImage(img, 0, 0, width, height)

      // Convert canvas to blob and create a new File
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          reject(new Error('Canvas conversion to blob failed'))
        }
      }, imageFile.type)

      URL.revokeObjectURL(img.src) // clean up the Object URL once done
    }

    img.onerror = () => reject(new Error('Failed to load the image'))
    img.src = URL.createObjectURL(imageFile)
  })
}