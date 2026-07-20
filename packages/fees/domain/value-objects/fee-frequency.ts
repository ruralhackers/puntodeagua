const feeFrequencies = ['ANNUAL', 'SEMIANNUAL', 'QUARTERLY', 'MONTHLY'] as const

export type FeeFrequencyValue = (typeof feeFrequencies)[number]

export class FeeFrequency {
  static readonly ANNUAL = FeeFrequency.fromString('ANNUAL')
  static readonly SEMIANNUAL = FeeFrequency.fromString('SEMIANNUAL')
  static readonly QUARTERLY = FeeFrequency.fromString('QUARTERLY')
  static readonly MONTHLY = FeeFrequency.fromString('MONTHLY')

  private constructor(private readonly value: FeeFrequencyValue) {}

  static fromString(value: string): FeeFrequency {
    if (!FeeFrequency.isValid(value)) {
      throw new Error(`Invalid fee frequency: ${value}`)
    }
    return new FeeFrequency(value as FeeFrequencyValue)
  }

  static values(): readonly FeeFrequencyValue[] {
    return feeFrequencies
  }

  static isValid(value: string): boolean {
    return feeFrequencies.includes(value as FeeFrequencyValue)
  }

  static periodsInYear(frequency: FeeFrequency | FeeFrequencyValue): number {
    const value = typeof frequency === 'string' ? frequency : frequency.toString()
    switch (value) {
      case 'ANNUAL':
        return 1
      case 'SEMIANNUAL':
        return 2
      case 'QUARTERLY':
        return 4
      case 'MONTHLY':
        return 12
      default:
        throw new Error(`Invalid fee frequency: ${value}`)
    }
  }

  static maxPeriodIndex(frequency: FeeFrequency | FeeFrequencyValue): number {
    return FeeFrequency.periodsInYear(frequency)
  }

  static assertPeriodIndex(frequency: FeeFrequency | FeeFrequencyValue, periodIndex: number) {
    const max = FeeFrequency.maxPeriodIndex(frequency)
    if (!Number.isInteger(periodIndex) || periodIndex < 1 || periodIndex > max) {
      throw new Error(`Invalid period index ${periodIndex} for frequency ${frequency}`)
    }
  }

  equals(other: FeeFrequency): boolean {
    return this.value === other.value
  }

  toString(): FeeFrequencyValue {
    return this.value
  }
}
