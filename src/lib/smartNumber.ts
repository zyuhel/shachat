import { toLocalCurrency } from '@/lib/toLocalCurrency'
import BigNumber from 'bignumber.js'
import bignumber from '@/lib/bignumber'

const compactOptions = {
  notation: 'compact',
  useGrouping: 'min2'
}
const decimalOptions = {
  style: 'decimal',
  maximumFractionDigits: 15
}
const toSmallPrecision = (value: number | bignumber | string, significantDigits = 1) => {
  return new BigNumber(value).precision(significantDigits, BigNumber.ROUND_DOWN)
}

const maximumBeforeCompact = 9999999
const significantDigits = 5
const minimumValue = toSmallPrecision(Math.pow(10, 1 - significantDigits))

export default function smartNumber(num: string | number, locale: string = 'en-US') {
  //smart numbers
  const stringifiedNumber = String(num)
  const integerPart = Math.trunc(Number(num))
  const integerPartCount = String(integerPart).length

  const decimalPart = stringifiedNumber.split('.')[1]

  // For very large numbers
  if (integerPart > maximumBeforeCompact) {
    return toLocalCurrency(stringifiedNumber, locale, compactOptions)
  }

  // For very small numbers
  if (integerPart < 10 && BigNumber(toSmallPrecision(`0.${decimalPart}`)) <= minimumValue) {
    const resultFullPart = toLocalCurrency(stringifiedNumber, locale, decimalOptions)
    const modifiedDecimal = String(toSmallPrecision(`0.${decimalPart}`))
      .split('.')
      .pop()
    return `${resultFullPart.split('.')[0]}.${String(modifiedDecimal).replace('0000', '00…')}`
  }

  // All other cases
  const maximumDecimalDigits = significantDigits - integerPartCount
  const visibleDecimals = decimalPart?.substring(0, maximumDecimalDigits) || ''

  return (
    toLocalCurrency(integerPart, locale, decimalOptions) +
    (visibleDecimals === '' ? '' : '.' + visibleDecimals)
  )
}
