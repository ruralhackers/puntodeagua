import {
  FeeFrequency,
  type FeeFrequencyValue,
  type FeePaymentKindValue,
  type PaymentMethodValue
} from '@pda/fees/domain'

export const kindLabels: Record<FeePaymentKindValue, string> = {
  PERIODIC: 'Cuota',
  SANCTION: 'Sanción',
  EXTRA: 'Cobro extra'
}

export const paymentMethodLabels: Record<PaymentMethodValue, string> = {
  TRANSFER: 'Transferencia',
  CASH: 'Efectivo'
}

export const frequencyLabels: Record<FeeFrequencyValue, string> = {
  ANNUAL: 'Anual',
  SEMIANNUAL: 'Semestral',
  QUARTERLY: 'Trimestral',
  MONTHLY: 'Mensual'
}

const monthLabels = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

export function periodIndexLabel(frequency: string, periodIndex: number): string {
  switch (frequency) {
    case 'ANNUAL':
      return 'Anual'
    case 'SEMIANNUAL':
      return periodIndex === 1 ? '1º semestre' : '2º semestre'
    case 'QUARTERLY':
      return `${periodIndex}º trimestre`
    case 'MONTHLY':
      return monthLabels[periodIndex - 1] ?? `Mes ${periodIndex}`
    default:
      return String(periodIndex)
  }
}

export function formatPeriod(
  frequency: string | null | undefined,
  periodYear: number | null | undefined,
  periodIndex: number | null | undefined
): string {
  if (!frequency || periodYear == null || periodIndex == null) {
    return '—'
  }
  return `${periodYear} · ${periodIndexLabel(frequency, periodIndex)}`
}

export function periodOptions(frequency: string): { value: number; label: string }[] {
  const max = FeeFrequency.maxPeriodIndex(FeeFrequency.fromString(frequency))
  return Array.from({ length: max }, (_, i) => {
    const value = i + 1
    return { value, label: periodIndexLabel(frequency, value) }
  })
}

export function formatAmount(amount: string): string {
  const n = Number(amount)
  if (!Number.isFinite(n)) return amount
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(n)
}
