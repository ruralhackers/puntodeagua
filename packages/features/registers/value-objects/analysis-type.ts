const analysisTypes = ['chlorine_ph', 'turbidity', 'hardness', 'complete']
export class AnalysisType {
  static CHLORINE_PH = new AnalysisType('chlorine_ph')
  static TURBIDITY = new AnalysisType('turbidity')
  static HARDNESS = new AnalysisType('hardness')
  static COMPLETE = new AnalysisType('complete')

  constructor(public readonly value: string) {}

  static create(value: string) {
    if (!AnalysisType.isValidType(value)) {
      throw new Error(`Invalid analysis type: ${value}`)
    }
    return new AnalysisType(value)
  }

  static isValidType(value: string): boolean {
    return analysisTypes.includes(value)
  }

  toString(): string {
    return this.value
  }

  static values(): string[] {
    return analysisTypes
  }
}
