const providerTypes = ['plumbing', 'electricity', 'analysis', 'masonry', 'other'] as const

export class ProviderType {
  static readonly PLUMBING = ProviderType.fromString('plumbing')
  static readonly ELECTRICITY = ProviderType.fromString('electricity')
  static readonly ANALYSIS = ProviderType.fromString('analysis')
  static readonly MASONRY = ProviderType.fromString('masonry')
  static readonly OTHER = ProviderType.fromString('other')

  private constructor(private readonly value: string) {}

  static fromString(value: string): ProviderType {
    if (!ProviderType.isValidType(value)) {
      throw new Error(`Invalid provider type: ${value}`)
    }
    return new ProviderType(value)
  }

  static values(): readonly string[] {
    return providerTypes
  }

  static isValidType(value: string): boolean {
    return providerTypes.includes(value as (typeof providerTypes)[number])
  }

  equals(other: ProviderType): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  isOther(): boolean {
    return this.value === 'other'
  }
}

