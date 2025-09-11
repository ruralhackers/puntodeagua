import { validate as uuidValidate, v4 as uuidv4 } from 'uuid'

export class Uuid {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static generateUniqueId() {
    return new Uuid(uuidv4())
  }

  static fromString(id: string) {
    if (!Uuid.isValidIdentifier(id)) {
      throw new Error(`Invalid UUID format: ${id}`)
    }
    return new Uuid(id)
  }

  equals(otherId: Uuid) {
    return this.value === otherId.value
  }

  toString() {
    return this.value
  }

  static isValidIdentifier(id: string): boolean {
    return uuidValidate(id)
  }
}
