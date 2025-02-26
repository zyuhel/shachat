import { isAddress as isEthAddress, isHexStrict } from 'web3-validator'
import { isValidAddress as isValidBtcAddress } from './bitcoin/bitcoin-utils'
import * as klayrCryptography from '@klayr/cryptography'
import { Cryptos, CryptosInfo, CryptoSymbol, isEthBased } from './constants'

/**
 * Checks address validity for a specified `crypto`.
 *
 * @param crypto - like 'ADM' or 'ETH'
 * @param address - value to check
 * @returns Returns `true` if address is valid, `false` otherwise
 */
export default function validateAddress(crypto: CryptoSymbol, address: string) {
  if (isEthBased(crypto)) {
    return isHexStrict(address) && isEthAddress(address)
  }

  if (crypto === Cryptos.KLY) {
    // We need to use try-catch https://github.com/LiskHQ/lisk-sdk/issues/6652
    try {
      return klayrCryptography.address.validateKlayr32Address(address)
    } catch {
      return false
    }
  }

  if (crypto === Cryptos.BTC) {
    return isValidBtcAddress(address)
  }

  for (const [symbol, { regexAddress }] of Object.entries(CryptosInfo)) {
    if (crypto === symbol && regexAddress) {
      return new RegExp(regexAddress).test(address)
    }
  }

  return true
}
