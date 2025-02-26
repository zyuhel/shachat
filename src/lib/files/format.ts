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
