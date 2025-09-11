import type { Deletable, Email, FindableForTable, Savable, Uuid } from '@ph/common/domain'
import type { User } from '../entities/user'

export interface UserRepository extends Savable<User>, Deletable<User>, FindableForTable<User> {
  findById(id: Uuid): Promise<User | undefined>
  findByEmail(email: Email): Promise<User | undefined>
}
