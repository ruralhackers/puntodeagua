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

  getLabel(): string {
    const labels: Record<string, string> = {
      chlorine_ph: 'Cloro y pH',
      turbidity: 'Turbidez',
      hardness: 'Dureza',
      complete: 'Análisis Completo'
    }
    return labels[this.value] || this.value
  }

  getFieldLabel(fieldName: string): string {
    const fieldLabels: Record<string, string> = {
      ph: 'pH',
      chlorine: 'Cloro',
      turbidity: 'Turbidez',
      description: 'Descripción'
    }
    return fieldLabels[fieldName] || fieldName
  }

  getFieldsByType() {
    const mandatoryFields = ['description']
    if (this.value === 'chlorine_ph') {
      return ['ph', 'chlorine', ...mandatoryFields]
    } else if (this.value === 'turbidity') {
      return ['turbidity', ...mandatoryFields]
    } else if (this.value === 'hardness') {
      return [...mandatoryFields]
    } else if (this.value === 'complete') {
      return [...mandatoryFields]
    } else {
      return [...mandatoryFields]
    }
  }
}
