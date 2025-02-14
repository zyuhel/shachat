import { isAddress as isEthAddress, isHexStrict } from 'web3-validator'
import { isValidAddress as isValidBtcAddress } from './bitcoin/bitcoin-utils'
import * as klayrCryptography from '@klayr/cryptography'
import { Cryptos, CryptosInfo, CryptoSymbol, isEthBased } from './constants'

/**
 * Checks if `address` is a valid address for the specified `crypto`.
 *
 * @param {string} crypto like 'ADM' or 'ETH'
 * @param {string} address value to check
 * @returns {boolean} `true` if address is valid, `false` otherwise
 */
export default function validateAddress(crypto: CryptoSymbol, address: string) {
  if (isEthBased(crypto)) {
    return isHexStrict(address) && isEthAddress(address)
  }

  if (crypto === Cryptos.KLY) {
    // We need to use try-catch https://github.com/LiskHQ/lisk-sdk/issues/6652
    try {
      return klayrCryptography.address.validateKlayr32Address(address)
    } catch (e) {
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
