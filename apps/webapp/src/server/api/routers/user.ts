import { Id } from '@pda/common/domain'
import { UserFactory } from '@pda/user'
import { userSchema } from '@pda/user/domain'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const repo = UserFactory.userPrismaRepository()
      const user = await repo.findById(Id.fromString(input.id))
      if (!user) return null
      return user.toClientDto()
    }),

  update: protectedProcedure.input(userSchema).mutation(async ({ input }) => {
    const user = await UserFactory.userUpdaterService().run(input)
    return user.toClientDto()
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      console.log('Deleting user with id:', input.id)
    })
})
