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
