export class Email {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static fromString(id: string) {
    if (!Email.isValidIdentifier(id)) {
      throw new Error(`Email.Invalid format ${id}`)
    }
    return new Email(id)
  }

  static isValidIdentifier(id: string) {
    if (typeof id !== 'string') return false
    // check if is a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(id)
  }

  equals(otherId: Email) {
    return this.value === otherId.value
  }

  toString(): string {
    return this.value
  }

  is(value: string) {
    return this.value === value
  }
}
