import { init, isCuid } from '@paralleldrive/cuid2'
import { z } from 'zod'

export const idSchema = z.string().cuid2()

export class Id {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static generateUniqueId(length = 25) {
    return new Id(Id.generateUuid(length))
  }

  static fromString(id: string) {
    if (!Id.isValidIdentifier(id)) {
      throw new Error(`Invalid Id format:${id}`)
    }
    return new Id(id)
  }

  equals(otherId: Id) {
    return this.value === otherId.value
  }

  toString() {
    return this.value
  }

  static isValidIdentifier(id: string) {
    return isCuid(id) || Id.isLegacyMongoObjectId(id)
  }

  private static generateUuid(length: number) {
    const createId = init({
      random: Math.random,
      length
    })

    return createId()
  }

  private static isLegacyMongoObjectId(id: string) {
    return /^[a-zA-Z0-9]{10,25}$/.test(id)
  }
}
