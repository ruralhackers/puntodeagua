import { Id } from '@pda/common/domain'
import { ProvidersFactory } from '@pda/providers'
import { Provider } from '@pda/providers/domain/entities/provider'
import { providerSchema } from '@pda/providers/domain/entities/provider.dto'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import {
  assertCommunityInScope,
  assertProviderBelongsToScope
} from '@/server/api/guards/community-scope.guards'
import { communityScopedProcedure, createTRPCRouter, requireCommunityId } from '@/server/api/trpc'

export const providersRouter = createTRPCRouter({
  // getProviders removed: it returned every community's providers with no
  // scope, and no screen called it.

  getProvidersByCommunityId: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityInScope(input.id, ctx.scope)

      const repo = ProvidersFactory.providerPrismaRepository()
      const providers = await repo.findByCommunityId(Id.fromString(input.id))
      return providers.map((provider) => provider.toDto())
    }),

  getProviderById: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      await assertProviderBelongsToScope(input.id, ctx.scope)

      const repo = ProvidersFactory.providerPrismaRepository()
      const provider = await repo.findById(Id.fromString(input.id))
      return provider?.toDto()
    }),

  addProvider: communityScopedProcedure
    .input(providerSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      // A provider always belongs to the caller's community: the schema allows a
      // null communityId, which would create one reachable by nobody.
      const communityId = requireCommunityId(ctx.scope, input.communityId ?? undefined)

      try {
        const service = ProvidersFactory.providerCreatorService()
        const provider = Provider.create(input)
        const savedProvider = await service.run({ provider })
        return savedProvider.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateProvider: communityScopedProcedure
    .input(providerSchema)
    .mutation(async ({ input, ctx }) => {
      await assertProviderBelongsToScope(input.id, ctx.scope)

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

  deleteProvider: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertProviderBelongsToScope(input.id, ctx.scope)

      try {
        const service = ProvidersFactory.providerDeleterService()
        await service.run({ id: Id.fromString(input.id) })
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  toggleProviderActive: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertProviderBelongsToScope(input.id, ctx.scope)

      try {
        const repo = ProvidersFactory.providerPrismaRepository()
        const provider = await repo.findById(Id.fromString(input.id))
        if (!provider) {
          throw new Error('Provider not found')
        }
        const service = ProvidersFactory.providerUpdaterService()
        const updatedProvider = await service.run({
          id: Id.fromString(input.id),
          updatedProviderData: {
            companyName: provider.companyName,
            taxId: provider.taxId,
            contactPerson: provider.contactPerson,
            contactPhone: provider.contactPhone,
            contactEmail: provider.contactEmail,
            secondaryPhone: provider.secondaryPhone,
            billingEmail: provider.billingEmail,
            address: provider.address,
            city: provider.city,
            postalCode: provider.postalCode,
            province: provider.province,
            providerType: provider.providerType.toString() as any,
            isActive: !provider.isActive,
            notes: provider.notes,
            businessHours: provider.businessHours,
            emergencyAvailable: provider.emergencyAvailable,
            emergencyPhone: provider.emergencyPhone,
            bankAccount: provider.bankAccount,
            paymentTerms: provider.paymentTerms,
            website: provider.website,
            communityId: provider.communityId?.toString()
          }
        })
        return updatedProvider.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    })
})
