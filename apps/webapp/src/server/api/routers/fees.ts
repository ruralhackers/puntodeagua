import { Id } from '@pda/common/domain'
import {
  FeePaymentKind,
  FeesFactory,
  feeConfigUpsertSchema,
  feePaymentCreateSchema,
  feePaymentUpdateSchema
} from '@pda/fees'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { assertCommunityAccess } from '@/server/api/guards/water-meter-community-guard'
import { createTRPCRouter, staffProcedure } from '@/server/api/trpc'

function requireSessionCommunityId(sessionCommunityId: string | undefined) {
  if (!sessionCommunityId) {
    throw new Error('User has no community')
  }
  return sessionCommunityId
}

export const feesRouter = createTRPCRouter({
  getConfig: staffProcedure
    .input(z.object({ communityId: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityAccess(input.communityId, ctx.session.user.community?.id)
      const service = FeesFactory.feeConfigFinderService()
      return service.run(Id.fromString(input.communityId))
    }),

  upsertConfig: staffProcedure.input(feeConfigUpsertSchema).mutation(async ({ input, ctx }) => {
    try {
      assertCommunityAccess(input.communityId, ctx.session.user.community?.id)
      const service = FeesFactory.feeConfigUpserterService()
      const config = await service.run({ data: input })
      return config.toDto()
    } catch (error) {
      handleDomainError(error)
    }
  }),

  listPayments: staffProcedure
    .input(
      z.object({
        communityId: z.string(),
        waterPointId: z.string().optional(),
        year: z.number().int().optional(),
        kind: z.enum(FeePaymentKind.values() as [string, ...string[]]).optional(),
        paidAtFrom: z.coerce.date().optional(),
        paidAtTo: z.coerce.date().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      assertCommunityAccess(input.communityId, ctx.session.user.community?.id)
      const service = FeesFactory.feePaymentFinderService()
      const payments = await service.run({
        communityId: Id.fromString(input.communityId),
        waterPointId: input.waterPointId ? Id.fromString(input.waterPointId) : undefined,
        year: input.year,
        kind: input.kind,
        paidAtFrom: input.paidAtFrom,
        paidAtTo: input.paidAtTo
      })
      return payments.map((payment) => payment.toDto())
    }),

  getPaymentById: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const sessionCommunityId = requireSessionCommunityId(ctx.session.user.community?.id)
      const service = FeesFactory.feePaymentFinderService()
      const payment = await service.byId(Id.fromString(input.id))
      if (!payment) return null
      assertCommunityAccess(payment.communityId.toString(), sessionCommunityId)
      return payment.toDto()
    }),

  createPayment: staffProcedure.input(feePaymentCreateSchema).mutation(async ({ input, ctx }) => {
    try {
      assertCommunityAccess(input.communityId, ctx.session.user.community?.id)
      const service = FeesFactory.feePaymentCreatorService()
      const payment = await service.run({ data: input })
      return payment.toDto()
    } catch (error) {
      handleDomainError(error)
    }
  }),

  updatePayment: staffProcedure
    .input(
      z.object({
        id: z.string(),
        data: feePaymentUpdateSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionCommunityId = requireSessionCommunityId(ctx.session.user.community?.id)
        const finder = FeesFactory.feePaymentFinderService()
        const existing = await finder.byId(Id.fromString(input.id))
        if (!existing) {
          throw new Error('Fee payment not found')
        }
        assertCommunityAccess(existing.communityId.toString(), sessionCommunityId)

        const service = FeesFactory.feePaymentUpdaterService()
        const payment = await service.run({
          id: Id.fromString(input.id),
          data: input.data
        })
        return payment.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  deletePayment: staffProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionCommunityId = requireSessionCommunityId(ctx.session.user.community?.id)
        const finder = FeesFactory.feePaymentFinderService()
        const existing = await finder.byId(Id.fromString(input.id))
        if (!existing) {
          throw new Error('Fee payment not found')
        }
        assertCommunityAccess(existing.communityId.toString(), sessionCommunityId)

        const service = FeesFactory.feePaymentDeleterService()
        await service.run({ id: Id.fromString(input.id) })
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    })
})
