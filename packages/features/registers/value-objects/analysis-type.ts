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

  static values() {
    return [
      AnalysisType.CHLORINE_PH,
      AnalysisType.TURBIDITY,
      AnalysisType.HARDNESS,
      AnalysisType.COMPLETE
    ]
  }

  toString(): string {
    return this.value
  }

  getFieldsByType() {
    if (this.value === 'chlorine_ph') {
      return ['ph', 'chlorine']
    } else if (this.value === 'turbidity') {
      return ['turbidity']
    } else if (this.value === 'hardness') {
      return []
    } else if (this.value === 'complete') {
      return []
    } else {
      return []
    }
  }
}
