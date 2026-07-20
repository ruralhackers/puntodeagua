const feePaymentKinds = ['PERIODIC', 'SANCTION', 'EXTRA'] as const

export type FeePaymentKindValue = (typeof feePaymentKinds)[number]

export class FeePaymentKind {
  static readonly PERIODIC = FeePaymentKind.fromString('PERIODIC')
  static readonly SANCTION = FeePaymentKind.fromString('SANCTION')
  static readonly EXTRA = FeePaymentKind.fromString('EXTRA')

  private constructor(private readonly value: FeePaymentKindValue) {}

  static fromString(value: string): FeePaymentKind {
    if (!FeePaymentKind.isValid(value)) {
      throw new Error(`Invalid fee payment kind: ${value}`)
    }
    return new FeePaymentKind(value as FeePaymentKindValue)
  }

  static values(): readonly FeePaymentKindValue[] {
    return feePaymentKinds
  }

  static isValid(value: string): boolean {
    return feePaymentKinds.includes(value as FeePaymentKindValue)
  }

  isPeriodic(): boolean {
    return this.value === 'PERIODIC'
  }

  equals(other: FeePaymentKind): boolean {
    return this.value === other.value
  }

  toString(): FeePaymentKindValue {
    return this.value
  }
}
