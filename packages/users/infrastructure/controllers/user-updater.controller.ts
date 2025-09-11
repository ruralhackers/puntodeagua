import { Uuid } from '@ph/common/domain'
import { type UserDto, userSchema } from '../../domain/entities/user.dto'
import type { UserRepository } from '../../domain/repositories/user-repository'

export class UserUpdaterController {
  constructor(private readonly repo: UserRepository) {}

  async run(input: UserDto) {
    const parsed = userSchema.parse(input)
    if (!parsed.id) throw new Error('MISSING_ID')

    const user = await this.repo.findById(Uuid.fromString(parsed.id))
    if (!user) throw new Error('USER_NOT_FOUND')

    user.update(parsed)

    await this.repo.save(user)
    return user.toDto()
  }
}
