import { Decimal } from '@pda/common/domain'
import { FeeFrequency } from './fee-frequency'

export const FEE_CONFIG_DEFAULTS = {
  annualAmount: '100',
  frequency: 'ANNUAL' as const,
  currency: 'EUR' as const
}

export function expectedAmountPerPeriod(
  annualAmount: Decimal | string,
  frequency: FeeFrequency | string
): Decimal {
  const amount = typeof annualAmount === 'string' ? Decimal.fromString(annualAmount) : annualAmount
  const periods = FeeFrequency.periodsInYear(
    typeof frequency === 'string' ? FeeFrequency.fromString(frequency) : frequency
  )
  return amount.divideBy(periods).decimals(2)
}

export function buildDefaultPayerLabel(waterPointName: string, waterAccountName: string | null) {
  if (!waterAccountName) {
    return waterPointName
  }
  return `${waterAccountName} · ${waterPointName}`
}
