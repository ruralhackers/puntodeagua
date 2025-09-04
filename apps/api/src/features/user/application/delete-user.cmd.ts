import type { Command } from 'core'
import type { UserRepository } from 'features'

export interface DeleteUserDto {
  userIdToDelete: string
  requestingUserRoles: string[]
  requestingUserCommunityId?: string | null
}

export class DeleteUserCmd implements Command<DeleteUserDto, void> {
  static readonly ID = 'DeleteUserCmd'

  constructor(private readonly userRepository: UserRepository) {}

  async handle(dto: DeleteUserDto): Promise<void> {
    const { userIdToDelete, requestingUserRoles, requestingUserCommunityId } = dto

    // Validate permissions
    const isSuperAdmin = requestingUserRoles.includes('SUPER_ADMIN')
    const isCommunityAdmin = requestingUserRoles.includes('COMMUNITY_ADMIN')

    if (!isSuperAdmin && !isCommunityAdmin) {
      throw new Error('Insufficient permissions to delete users')
    }

    // Get user to delete to check permissions
    const userToDelete = await this.userRepository.findById(userIdToDelete)

    if (!userToDelete) {
      throw new Error('User not found')
    }

    // COMMUNITY_ADMIN can only delete users from their own community
    if (!isSuperAdmin) {
      if (userToDelete.communityId !== requestingUserCommunityId) {
        throw new Error('Can only delete users from your own community')
      }

      // COMMUNITY_ADMIN cannot delete SUPER_ADMIN users
      if (userToDelete.roles.includes('SUPER_ADMIN')) {
        throw new Error('Cannot delete SUPER_ADMIN users')
      }
    }

    await this.userRepository.delete(userIdToDelete)
  }
}
