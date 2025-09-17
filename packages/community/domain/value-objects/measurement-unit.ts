export const measurementUnitValues = [
  'L', // Liters
  'M3' // Cubic meters
] as const

export class MeasurementUnit {
  static readonly L = MeasurementUnit.fromString('L')
  static readonly M3 = MeasurementUnit.fromString('M3')

  private constructor(private readonly value: string) {}

  static fromString(raw: string): MeasurementUnit {
    if (!measurementUnitValues.includes(raw as any)) {
      throw new Error('Invalid measurement unit')
    }
    return new MeasurementUnit(raw)
  }

  equals(other: MeasurementUnit): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
