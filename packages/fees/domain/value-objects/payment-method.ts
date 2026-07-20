const paymentMethods = ['TRANSFER', 'CASH'] as const

export type PaymentMethodValue = (typeof paymentMethods)[number]

export class PaymentMethod {
  static readonly TRANSFER = PaymentMethod.fromString('TRANSFER')
  static readonly CASH = PaymentMethod.fromString('CASH')

  private constructor(private readonly value: PaymentMethodValue) {}

  static fromString(value: string): PaymentMethod {
    if (!PaymentMethod.isValid(value)) {
      throw new Error(`Invalid payment method: ${value}`)
    }
    return new PaymentMethod(value as PaymentMethodValue)
  }

  static values(): readonly PaymentMethodValue[] {
    return paymentMethods
  }

  static isValid(value: string): boolean {
    return paymentMethods.includes(value as PaymentMethodValue)
  }

  equals(other: PaymentMethod): boolean {
    return this.value === other.value
  }

  toString(): PaymentMethodValue {
    return this.value
  }
}
