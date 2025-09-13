import type { Deletable, FindableAll, FindableById, Id, Savable } from 'core'
import type { User } from '../entities/user'

export interface UserRepository
  extends Savable<User>,
    Deletable<User>,
    FindableById<User>,
    FindableAll<User> {
  findByEmail(email: string): Promise<User | undefined>
  findByCommunity(communityId: Id): Promise<User[]>
}
