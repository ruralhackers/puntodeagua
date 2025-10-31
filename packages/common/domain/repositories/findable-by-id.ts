import type { Id } from '../value-objects/id'

export interface FindableById<In> {
  findById(id: Id): Promise<In | undefined>
}
