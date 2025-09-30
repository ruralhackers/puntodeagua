import { ForbiddenError } from '@pda/common/domain'

export class AnalysisPhRequiredError extends ForbiddenError {
  constructor(message: string = AnalysisPhRequiredError.defaultMessage) {
    super(message)
    this.name = 'AnalysisPhRequiredError'
  }

  static override defaultMessage = 'Ph is required for chlorine_ph analysis'
  static override defaultMessageEs = 'El pH es requerido para análisis de cloro y pH'
}

export class AnalysisTurbidityRequiredError extends ForbiddenError {
  constructor(message: string = AnalysisTurbidityRequiredError.defaultMessage) {
    super(message)
    this.name = 'AnalysisTurbidityRequiredError'
  }

  static override defaultMessage = 'Turbidity is required for turbidity analysis'
  static override defaultMessageEs = 'La turbidez es requerida para análisis de turbidez'
}

export class AnalysisChlorineRequiredError extends ForbiddenError {
  constructor(message: string = AnalysisChlorineRequiredError.defaultMessage) {
    super(message)
    this.name = 'AnalysisChlorineRequiredError'
  }

  static override defaultMessage = 'Chlorine is required for complete analysis'
  static override defaultMessageEs = 'El cloro es requerido para análisis completo'
}

export class AnalysisCompleteMeasurementsRequiredError extends ForbiddenError {
  constructor(message: string = AnalysisCompleteMeasurementsRequiredError.defaultMessage) {
    super(message)
    this.name = 'AnalysisCompleteMeasurementsRequiredError'
  }

  static override defaultMessage = 'Ph, chlorine and turbidity are required for complete analysis'
  static override defaultMessageEs = 'El pH, cloro y turbidez son requeridos para análisis completo'
}

export class AnalysisHardnessPhRequiredError extends ForbiddenError {
  constructor(message: string = AnalysisHardnessPhRequiredError.defaultMessage) {
    super(message)
    this.name = 'AnalysisHardnessPhRequiredError'
  }

  static override defaultMessage = 'Ph is required for hardness analysis'
  static override defaultMessageEs = 'El pH es requerido para análisis de dureza'
}
