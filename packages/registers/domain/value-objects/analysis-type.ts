const analysisTypes = ['chlorine_ph', 'turbidity', 'hardness', 'complete'] as const

export class AnalysisType {
  static readonly CHLORINE_PH = AnalysisType.fromString('chlorine_ph')
  static readonly TURBIDITY = AnalysisType.fromString('turbidity')
  static readonly HARDNESS = AnalysisType.fromString('hardness')
  static readonly COMPLETE = AnalysisType.fromString('complete')

  private constructor(private readonly value: string) {}

  static fromString(value: string): AnalysisType {
    if (!AnalysisType.isValidType(value)) {
      throw new Error(`Invalid analysis type: ${value}`)
    }
    return new AnalysisType(value)
  }

  static values(): readonly string[] {
    return analysisTypes
  }

  static isValidType(value: string): boolean {
    return analysisTypes.includes(value as (typeof analysisTypes)[number])
  }

  equals(other: AnalysisType): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
