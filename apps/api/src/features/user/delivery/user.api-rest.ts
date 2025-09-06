import { UseCaseService } from 'core'
import { Elysia, t } from 'elysia'
import { apiContainer } from '../../../api.container'
import { CreateUserCmd } from '../application/create-user.cmd'
import { DeleteUserCmd } from '../application/delete-user.cmd'
import { GetUsersQry } from '../application/get-users.qry'

const createUserSchema = t.Object({
  email: t.String({ format: 'email' }),
  name: t.Optional(t.Union([t.String(), t.Null()])),
  password: t.String({ minLength: 6 }),
  roles: t.Array(t.String()),
  communityId: t.Optional(t.Union([t.String(), t.Null()]))
})

interface AuthenticatedUser {
  userId: string
  email: string
  roles: string[]
  communityId: string | null
}

export const userApiRest = new Elysia()
  .get('/users', async ({ user, set }) => {
    if (!user) {
      set.status = 401
      return { error: 'User authentication required' }
    }

    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const authenticatedUser = user as AuthenticatedUser

    const filters = {
      requestingUserId: authenticatedUser.userId,
      requestingUserRoles: authenticatedUser.roles,
      requestingUserCommunityId: authenticatedUser.communityId
    }

    const result = await useCaseService.execute(GetUsersQry, filters)
    return result
  })
  .post(
    '/users',
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401
        return { error: 'User authentication required' }
      }

      const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
      const authenticatedUser = user as AuthenticatedUser

      const createUserDto = {
        ...body,
        requestingUserRoles: authenticatedUser.roles,
        requestingUserCommunityId: authenticatedUser.communityId
      }

      const newUser = await useCaseService.execute(CreateUserCmd, createUserDto)
      return newUser
    },
    {
      body: createUserSchema
    }
  )
  .delete('/users/:id', async ({ params, user, set }) => {
    if (!user) {
      set.status = 401
      return { error: 'User authentication required' }
    }

    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const authenticatedUser = user as AuthenticatedUser

    const deleteUserDto = {
      userIdToDelete: params.id,
      requestingUserRoles: authenticatedUser.roles,
      requestingUserCommunityId: authenticatedUser.communityId
    }

    await useCaseService.execute(DeleteUserCmd, deleteUserDto)
    return { success: true }
  })
