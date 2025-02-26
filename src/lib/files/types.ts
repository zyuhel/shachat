import { EncodedFile } from '@/lib/adamant-api'

export type FileData = {
  cid: string
  name: string
  type: string
  content: string
  isImage: boolean
  file: File
  encoded: EncodedFile
  width?: number
  height?: number
  preview?: {
    cid: string
    file: File
    encoded: EncodedFile
    content: string
    width: number
    height: number
  }
}

export type LocalFile = {
  file: FileData
  loading: boolean
  error: string | null
}
