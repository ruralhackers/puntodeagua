import { Id } from 'core'
import type { HolderSchema } from '../schemas/holder.schema.ts'

export class Holder {
  private constructor(
    public readonly id: Id,
    public name: string
  ) {}

  static create(holderSchema: HolderSchema) {
    return new Holder(Id.create(holderSchema.id), holderSchema.name)
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name
    }
  }
}
