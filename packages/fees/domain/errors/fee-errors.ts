import { ForbiddenError, NotFoundError } from '@pda/common/domain'

export class FeeConfigNotFoundError extends NotFoundError {
  constructor(message: string = FeeConfigNotFoundError.defaultMessage) {
    super(message)
    this.name = 'FeeConfigNotFoundError'
  }

  static override defaultMessage = 'Fee config not found'
  static override defaultMessageEs = 'Configuración de cobros no encontrada'
}

export class FeePaymentNotFoundError extends NotFoundError {
  constructor(message: string = FeePaymentNotFoundError.defaultMessage) {
    super(message)
    this.name = 'FeePaymentNotFoundError'
  }

  static override defaultMessage = 'Fee payment not found'
  static override defaultMessageEs = 'Cobro no encontrado'
}

export class WaterPointNotInCommunityError extends ForbiddenError {
  constructor(message: string = WaterPointNotInCommunityError.defaultMessage) {
    super(message)
    this.name = 'WaterPointNotInCommunityError'
  }

  static override defaultMessage = 'Water point does not belong to this community'
  static override defaultMessageEs = 'El punto de agua no pertenece a esta comunidad'
}
