import { FileAsset } from '@/lib/adamant-api/asset'
import { LocalFile } from './types'

export function isLocalFile(file: FileAsset | LocalFile): file is LocalFile {
  return 'file' in file && file.file?.file instanceof File
}
