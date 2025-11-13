import { ForbiddenError, NotFoundError } from '@pda/common/domain'

export class ProviderNotFoundError extends NotFoundError {
  constructor(message: string = ProviderNotFoundError.defaultMessage) {
    super(message)
    this.name = 'ProviderNotFoundError'
  }

  static override defaultMessage = 'Provider not found'
  static override defaultMessageEs = 'Proveedor no encontrado'
}

export class InvalidProviderTypeError extends ForbiddenError {
  constructor(message: string = InvalidProviderTypeError.defaultMessage) {
    super(message)
    this.name = 'InvalidProviderTypeError'
  }

  static override defaultMessage = 'Invalid provider type'
  static override defaultMessageEs = 'Tipo de proveedor inválido'
}
