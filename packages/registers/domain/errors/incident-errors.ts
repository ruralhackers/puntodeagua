import { ForbiddenError, NotFoundError } from '@pda/common/domain'

export class IncidentNotFoundError extends NotFoundError {
  constructor(message: string = IncidentNotFoundError.defaultMessage) {
    super(message)
    this.name = 'IncidentNotFoundError'
  }

  static override defaultMessage = 'Incident not found'
  static override defaultMessageEs = 'Incidente no encontrado'
}

export class IncidentEndDateBeforeStartDateError extends ForbiddenError {
  constructor(message: string = IncidentEndDateBeforeStartDateError.defaultMessage) {
    super(message)
    this.name = 'IncidentEndDateBeforeStartDateError'
  }

  static override defaultMessage = 'End date cannot be before start date'
  static override defaultMessageEs = 'La fecha de fin no puede ser anterior a la fecha de inicio'
}

export class IncidentClosedWithoutEndDateError extends ForbiddenError {
  constructor(message: string = IncidentClosedWithoutEndDateError.defaultMessage) {
    super(message)
    this.name = 'IncidentClosedWithoutEndDateError'
  }

  static override defaultMessage = 'Closed incidents must have an end date'
  static override defaultMessageEs = 'Los incidentes cerrados deben tener una fecha de fin'
}
