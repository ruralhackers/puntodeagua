import { ForbiddenError, NotFoundError } from '@pda/common/domain'

export class WaterMeterNotFoundError extends NotFoundError {
  constructor(message: string = WaterMeterNotFoundError.defaultMessage) {
    super(message)
    this.name = 'WaterMeterNotFoundError'
  }

  static override defaultMessage = 'Water meter not found'
  static override defaultMessageEs = 'Contador no encontrado'
}

export class WaterMeterReadingDateNotAllowedError extends ForbiddenError {
  constructor(message: string = WaterMeterReadingDateNotAllowedError.defaultMessage) {
    super(message)
    this.name = 'WaterMeterReadingDateNotAllowedError'
  }

  static override defaultMessage = 'Water meter reading date is not allowed'
  static override defaultMessageEs = 'La fecha de lectura del contador no es válida'
}

export class WaterMeterReadingNotAllowedError extends ForbiddenError {
  constructor(message: string = WaterMeterReadingNotAllowedError.defaultMessage) {
    super(message)
    this.name = 'WaterMeterReadingNotAllowedError'
  }

  static override defaultMessage = 'New reading is lower than last reading'
  static override defaultMessageEs = 'La nueva lectura es menor que la última lectura'
}
