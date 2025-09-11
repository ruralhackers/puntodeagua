import type { Uuid } from '../value-objects/uuid'
export interface Deletable<In> {
  delete(id: Uuid): Promise<void>
}
