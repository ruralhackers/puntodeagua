import { Id } from '@pda/common/domain'
import type { UserRepository } from '../../domain/repositories/user-repository'

export interface UserUpdateInput {
  id: string
  name?: string
}

export class UserUpdater {
  constructor(private readonly repo: UserRepository) {}

  async run(input: UserUpdateInput) {
    const user = await this.repo.findById(Id.fromString(input.id))
    if (!user) throw new Error('USER_NOT_FOUND')

    // Only the name is updatable here. Roles and password changes are
    // deliberately out of scope: they need their own use cases with their own
    // authorisation rules.
    user.update({ name: input.name })

    await this.repo.save(user)
    return user
  }
}
