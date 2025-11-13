import { Id } from '@pda/common/domain'
import { ProvidersFactory } from '@pda/providers'
import { Provider } from '@pda/providers/domain/entities/provider'
import { providerSchema } from '@pda/providers/domain/entities/provider.dto'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const providersRouter = createTRPCRouter({
  getProviders: protectedProcedure.query(async () => {
    const repo = ProvidersFactory.providerPrismaRepository()
    const providers = await repo.findAll()
    return providers.map((provider) => provider.toDto())
  }),

  getProvidersByCommunityId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = ProvidersFactory.providerPrismaRepository()
      const providers = await repo.findByCommunityId(Id.fromString(input.id))
      return providers.map((provider) => provider.toDto())
    }),

  getProviderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = ProvidersFactory.providerPrismaRepository()
      const provider = await repo.findById(Id.fromString(input.id))
      return provider?.toDto()
    }),

  addProvider: protectedProcedure
    .input(providerSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      try {
        const service = ProvidersFactory.providerCreatorService()
        const provider = Provider.create(input)
        const savedProvider = await service.run({ provider })
        return savedProvider.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateProvider: protectedProcedure.input(providerSchema).mutation(async ({ input }) => {
    try {
      const service = ProvidersFactory.providerUpdaterService()
      const { id, ...updateData } = input
      const savedProvider = await service.run({
        id: Id.fromString(id),
        updatedProviderData: updateData
      })
      return savedProvider.toDto()
    } catch (error) {
      handleDomainError(error)
    }
  }),

  deleteProvider: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const repo = ProvidersFactory.providerPrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    })
})
