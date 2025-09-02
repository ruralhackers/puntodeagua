import { init, isCuid } from '@paralleldrive/cuid2'
import type { IdSchema } from "../types/id.schema.ts";

export class Id {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

	static create(id: IdSchema) {
		if (!Id.isValidIdentifier(id)) {
      throw new Error(`Invalid Id format:${id}`)
    }
		return new Id(id);
	}

  static generateUniqueId(length = 25) {
    return new Id(Id.generateUuid(length))
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
