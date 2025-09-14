import type { Id } from '../value-objects/id'
export interface Deletable<In> {
  delete(id: Id): Promise<void>
}
