export class BadRequestError extends Error {
  constructor(message: string = BadRequestError.defaultMessage) {
    super(message)
    this.name = 'BadRequestError'
  }

  static defaultMessage = 'Bad Request'
  static defaultMessageEs = 'Solicitud Incorrecta'
  static statusCode = 400
}

export class ForbiddenError extends Error {
  constructor(message: string = ForbiddenError.defaultMessage) {
    super(message)
    this.name = 'ForbiddenError'
  }

  static defaultMessage = 'Forbidden'
  static defaultMessageEs = 'No Permitido'
  static statusCode = 403
}

export class NotFoundError extends Error {
  constructor(message: string = NotFoundError.defaultMessage) {
    super(message)
    this.name = 'NotFoundError'
  }

  static defaultMessage = 'Not Found'
  static defaultMessageEs = 'No Encontrado'
  static statusCode = 404
}
