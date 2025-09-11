import { userSchema } from '@ph/users/domain'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  update: protectedProcedure.input(userSchema).mutation(async ({ input }) => {
    console.log('Updating user with data:', input)
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      console.log('Deleting user with id:', input.id)
    })
})
