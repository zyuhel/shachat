/**
 * Format size in a human-readable format.
 * @param size - Size of the file in bytes
 */
export function formatBytes(size: number) {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 ** 2) {
    return Math.floor(size / 1024) + ' KB'
  } else if (size < 1024 ** 3) {
    return Math.floor(size / 1024 ** 2) + ' MB'
  } else {
    return parseFloat((size / 1024 ** 3).toFixed(2)) + ' GB'
  }
}

/**
 * Extract extension from filename.
 * @param fileName
 * @returns Returns `undefined` if the file has no extension
 */
export function extractFileExtension(fileName: string) {
  if (!fileName.includes('.')) {
    return
  }

  return fileName.split('.').at(-1)
}

/**
 * Extract filename omitting extension
 * @param fileName
 */
export function extractFileName(fileName: string) {
  if (!fileName.includes('.')) {
    return fileName
  }

  return fileName.split('.').slice(0, -1).join('.')
}
