import config from '../index'

/**
 * Returns explorer crypto address URL.
 *
 * @param {string} crypto like 'adm' or 'eth'
 * @param {string} address Crypto address
 */
export function getExplorerAddressUrl(crypto: string, address: string): string {
  const explorerAddress = config[crypto.toLowerCase()].explorerAddress

  if (!explorerAddress) {
    return ''
  }

  const data = { ID: address }

  return explorerAddress.replace(
    /\${([a-zA-Z_]+?)}/g,
    (_: string, key: keyof typeof data) => data[key]
  )
}
