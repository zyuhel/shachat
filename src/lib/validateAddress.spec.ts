import validateAddress from './validateAddress'
import { describe, it, expect } from 'vitest'
import { Cryptos } from './constants'

describe('validateAddress', () => {
  it('validates Ethereum address', () => {
    expect(validateAddress(Cryptos.ETH, '0x0000000000000000000000000000000000000000')).toBe(true)
    expect(validateAddress(Cryptos.ETH, 'invalid_eth_address')).toBe(false)
  })

  it('validates ADM (Adamant) address using regex', () => {
    expect(validateAddress(Cryptos.ADM, 'U111111')).toBe(true)
    expect(validateAddress(Cryptos.ADM, 'A123')).toBe(false)
    expect(validateAddress(Cryptos.ADM, '6g5FsXmXJozxfZo7vJrC5eF5zLhW1vmF')).toBe(false)
  })

  it('validates KLY address with try-catch', () => {
    expect(validateAddress(Cryptos.KLY, 'klyr9pzfwknqg6hz3mb8kkhfvesqagd3nt7nqj78p')).toBe(true)

    expect(validateAddress(Cryptos.KLY, 'invalid_kly_address')).toBe(false)
  })

  it('validates BTC address', () => {
    expect(validateAddress(Cryptos.BTC, 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true) // SegWit address - P2WPKH
    expect(validateAddress(Cryptos.BTC, '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true) // Script address - P2SH
    expect(validateAddress(Cryptos.BTC, '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true) // Legacy address - P2PKH

    expect(validateAddress(Cryptos.BTC, 'invalid_btc_address')).toBe(false)
  })

  it('validates ETH based cryptos', () => {
    expect(validateAddress(Cryptos.USDT, '0x0000000000000000000000000000000000000000')).toBe(true)
    expect(validateAddress(Cryptos.USDT, '0x1234567890abcdef')).toBe(false)

    expect(validateAddress(Cryptos.USDC, '0x0000000000000000000000000000000000000000')).toBe(true)
    expect(validateAddress(Cryptos.USDC, '0y0000000000000000000000000000000000000000')).toBe(false)
  })

  it('validates using regex for other cryptos', () => {
    expect(validateAddress(Cryptos.DOGE, 'A1B2C3D4E5F')).toBe(true)
    expect(validateAddress(Cryptos.DOGE, 'B1B2C3D4E5F')).toBe(false)

    expect(validateAddress(Cryptos.DASH, '7A1B2C3D4E5F6G7H8J9KLMNPQRSTUVWXYZabcde')).toBe(true)
    expect(validateAddress(Cryptos.DASH, '70IOl000000000000000000000000000000\n')).toBe(false)
  })

  it('returns true for unknown cryptos', () => {
    expect(validateAddress('UNKNOWN' as keyof typeof Cryptos, 'random_address')).toBe(true)
  })
})
