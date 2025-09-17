import type { Deletable, Email, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { User } from '../entities/user'

export interface UserRepository extends Savable<User>, Deletable<User>, FindableForTable<User> {
  findById(id: Id): Promise<User | undefined>
  findByEmail(email: Email): Promise<User | undefined>
}
