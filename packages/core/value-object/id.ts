import { createId, init, isCuid } from '@paralleldrive/cuid2'
import { idSchema } from '../types/id.schema.ts'

export class Id {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(raw: string) {
    const parsed = idSchema.parse(raw) // throws if invalid
    return new Id(parsed)
  }

  static generateUniqueId(length = 25) {
    const generatedId = new Id(Id.generateUuid(length))
    console.log('generatedId', generatedId)
    return generatedId
  }

  static isValidIdentifier(id: string) {
    return isCuid(id)
  }

  equals(otherId: Id) {
    return this.value === otherId.value
  }

  toString() {
    return this.value
  }

  private static generateUuid(length: number) {
    const createdId = init({
      random: Math.random,
      length
    })
    return createdId()
  }
}
