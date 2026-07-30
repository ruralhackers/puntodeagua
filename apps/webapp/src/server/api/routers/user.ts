import { Id, idSchema } from '@pda/common/domain'
import { UserFactory } from '@pda/user'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { assertUserBelongsToScope } from '@/server/api/guards/community-scope.guards'
import { communityScopedProcedure, createTRPCRouter } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  getById: communityScopedProcedure
    .input(z.object({ id: idSchema }))
    .query(async ({ input, ctx }) => {
      await assertUserBelongsToScope(input.id, ctx.scope)

      const repo = UserFactory.userPrismaRepository()
      const user = await repo.findById(Id.fromString(input.id))
      if (!user) return null
      return user.toClientDto()
    }),

  update: communityScopedProcedure
    // Narrow and strict on purpose. The input used to be the full userSchema,
    // which accepted passwordHash and roles straight from the client.
    .input(z.object({ id: idSchema, name: z.string().min(1).optional() }).strict())
    .mutation(async ({ input, ctx }) => {
      await assertUserBelongsToScope(input.id, ctx.scope)

      const user = await UserFactory.userUpdaterService().run(input)
      return user.toClientDto()
    }),

  delete: communityScopedProcedure.input(z.object({ id: idSchema })).mutation(() => {
    // Deliberately not implemented: deleting a user needs a decision on what
    // happens to the readings and incidents they created. It used to be a
    // console.log, which made the UI look like it had deleted something.
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Deleting users is not supported yet'
    })
  })
})
