import type { Id } from '../value-object/id'
export interface Deletable<In> {
  delete(id: Id): Promise<void>
}
