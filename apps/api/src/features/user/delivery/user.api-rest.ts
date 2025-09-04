import { UseCaseService } from 'core'
import { Elysia, t } from 'elysia'
import { apiContainer } from '../../../api.container'
import { authMiddleware } from '../../../middleware/auth.middleware'
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

export const userApiRest = authMiddleware(new Elysia())
  .get('/users', async ({ user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    const filters = {
      requestingUserId: user.userId,
      requestingUserRoles: user.roles,
      requestingUserCommunityId: user.communityId
    }

    const result = await useCaseService.execute(GetUsersQry, filters)
    return result
  })
  .post(
    '/users',
    async ({ body, user }) => {
      const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

      const createUserDto = {
        ...body,
        requestingUserRoles: user.roles,
        requestingUserCommunityId: user.communityId
      }

      const newUser = await useCaseService.execute(CreateUserCmd, createUserDto)
      return newUser
    },
    {
      body: createUserSchema
    }
  )
  .delete('/users/:id', async ({ params, user }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    const deleteUserDto = {
      userIdToDelete: params.id,
      requestingUserRoles: user.roles,
      requestingUserCommunityId: user.communityId
    }

    await useCaseService.execute(DeleteUserCmd, deleteUserDto)
    return { success: true }
  })
