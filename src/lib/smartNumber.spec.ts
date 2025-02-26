import { describe, it, expect } from 'vitest'

import smartNumber from './smartNumber'

describe('smartNumber', () => {
  it('should convert amount to compact notation', () => {
    const numbers = [
      12345678,
      123456789.888742,
      '1234567890.0000054',
      12345678901.03,
      '123456789012.34560',
      '1234567890123',
      '12345678901234.001233',
      123456789012345,
      '1234567890123456.594679999999999'
    ].map((value) => smartNumber(value))

    expect(numbers[0]).toBe('12M')
    expect(numbers[1]).toBe('123M')
    expect(numbers[2]).toBe('1.2B')
    expect(numbers[3]).toBe('12B')
    expect(numbers[4]).toBe('123B')
    expect(numbers[5]).toBe('1.2T')
    expect(numbers[6]).toBe('12T')
    expect(numbers[7]).toBe('123T')
  })

  it('should divide thousands by commas', () => {
    const numbers = [12345.67, 1234.567, 12345, '12345.6', '123456.678', '1234567.6789'].map(
      (value) => smartNumber(value)
    )

    expect(numbers[0]).toBe('12,345')
    expect(numbers[1]).toBe('1,234.5')
    expect(numbers[2]).toBe('12,345')
    expect(numbers[3]).toBe('12,345')
    expect(numbers[4]).toBe('123,456')
    expect(numbers[5]).toBe('1,234,567')
  })

  it('should round decimal part', () => {
    const numbers = [123.4567, 12.34567, 0.0697, '0.0007', '0.00077', '0.0001', 0.00018].map(
      (value) => smartNumber(value)
    )

    expect(numbers[0]).toBe('123.45')
    expect(numbers[1]).toBe('12.345')
    expect(numbers[2]).toBe('0.0697')
    expect(numbers[3]).toBe('0.0007')
    expect(numbers[4]).toBe('0.0007')
    expect(numbers[5]).toBe('0.0001')
    expect(numbers[6]).toBe('0.0001')
  })

  it('should cut zeroes', () => {
    const numbers = [0.0001, 0.00009, 0.000091, '0.00009104', 0.00008, 9.000089, 4.00002109].map(
      (value) => smartNumber(value)
    )

    expect(numbers[0]).toBe('0.0001')
    expect(numbers[1]).toBe('0.00…9')
    expect(numbers[2]).toBe('0.00…9')
    expect(numbers[3]).toBe('0.00…9')
    expect(numbers[4]).toBe('0.00…8')
    expect(numbers[5]).toBe('9.00…8')
    expect(numbers[6]).toBe('4.00…2')
  })
})
