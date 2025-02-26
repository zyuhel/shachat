/**
 * Converts a hex string representation (e.g. `0xdeadbeef`) to the respective byte array
 * @param {string} hexString hex string
 * @returns {Uint8Array}
 */
export function hexToBytes(hexString = '') {
  const bytes = []

  for (let c = 0; c < hexString.length; c += 2) {
    bytes.push(parseInt(hexString.substr(c, 2), 16))
  }

  return Uint8Array.from(bytes)
}

/**
 * Converts a bytes array to the respective string representation
 * @param {Array<number>|Uint8Array|Buffer} bytes bytes array
 * @returns {string}
 */
export function bytesToHex(bytes = []) {
  const hex = []

  bytes.forEach((b) => {
    hex.push((b >>> 4).toString(16))
    hex.push((b & 0xf).toString(16))
  })

  return hex.join('')
}
