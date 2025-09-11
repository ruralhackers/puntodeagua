import { Uuid } from '@ph/common/domain'
import { UserFactory } from '@ph/users'
import { userSchema } from '@ph/users/domain'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const repo = UserFactory.userPrismaRepository()
      const user = await repo.findById(Uuid.fromString(input.id))
      if (!user) return null
      return user.toDto()
    }),

  update: protectedProcedure.input(userSchema).mutation(async ({ input }) => {
    const controller = UserFactory.userUpdaterController()
    return controller.run(input)
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      console.log('Deleting user with id:', input.id)
    })
})
