import { Id } from '@pda/common/domain'
import { CommunityFactory, WaterDeposit } from '@pda/community'
import { WaterAccountFactory } from '@pda/water-account'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import {
  assertCommunityInScope,
  assertDepositsBelongToScope,
  assertWaterPointBelongsToScope,
  assertZoneIdsBelongToScope
} from '@/server/api/guards/water-meter-community-guard'
import {
  communityScopedProcedure,
  createTRPCRouter,
  resolveCommunityScope,
  waterDepositManagementProcedure,
  waterMeterReaderAllowedProcedure,
  waterPointManagementProcedure
} from '@/server/api/trpc'

export const communityRouter = createTRPCRouter({
  getCommunityZones: waterMeterReaderAllowedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // The check used to run only for reader-only users, leaving every staff
      // role able to list another community's zones.
      const scope = resolveCommunityScope(
        ctx.session.user.roles ?? [],
        ctx.session.user.community?.id
      )
      assertCommunityInScope(input.id, scope)

      const repo = CommunityFactory.communityZonePrismaRepository()
      const zones = await repo.findByCommunityId(Id.fromString(input.id))
      return zones.map((zone) => zone.toDto())
    }),
  getWaterPoints: communityScopedProcedure
    .input(z.object({ zoneIds: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      await assertZoneIdsBelongToScope(input.zoneIds, ctx.scope)

      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityZonesId(input.zoneIds.map(Id.fromString))
      return waterPoints.map((waterPoint) => waterPoint.toDto())
    }),

  // getWaterPointsWithAccount removed: unscoped and called by no screen.
  // getWaterPointsByCommunityWithAccount covers the legitimate case.

  getWaterPointsByCommunityWithAccount: communityScopedProcedure
    .input(z.object({ communityId: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityInScope(input.communityId, ctx.scope)

      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityIdWithAccount(Id.fromString(input.communityId))
      return waterPoints
    }),
  getWaterPointById: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      await assertWaterPointBelongsToScope(input.id, ctx.scope)

      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoint = await repo.findById(Id.fromString(input.id))
      if (!waterPoint) return null
      return waterPoint.toDto()
    }),

  getWaterDepositsByCommunityId: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityInScope(input.id, ctx.scope)

      const repo = CommunityFactory.waterDepositPrismaRepository()
      const waterDeposits = await repo.findByCommunityId(Id.fromString(input.id))
      return waterDeposits.map((waterDeposit) => waterDeposit.toDto())
    }),

  // getDepositsByWaterPointId removed: unscoped and called by no screen.

  createWaterDeposit: waterDepositManagementProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string(),
        notes: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const communityId = ctx.session.user.community?.id
      if (!communityId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User has no community assigned'
        })
      }

      try {
        const service = CommunityFactory.waterDepositCreatorService()
        const deposit = WaterDeposit.create({ ...input, communityId })
        const savedDeposit = await service.run({ deposit })
        return savedDeposit.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateWaterDeposit: waterDepositManagementProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        location: z.string().optional(),
        notes: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const communityId = ctx.session.user.community?.id
      if (!communityId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User has no community assigned'
        })
      }

      try {
        const service = CommunityFactory.waterDepositUpdaterService()
        const savedDeposit = await service.run({
          id: Id.fromString(input.id),
          communityId: Id.fromString(communityId),
          updatedData: {
            name: input.name,
            location: input.location,
            notes: input.notes
          }
        })
        return savedDeposit.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  // updateWaterPointDeposits removed: unscoped, called by no screen, and it
  // mutated the entity straight from the router. updateWaterPointData already
  // accepts waterDepositIds through its application service.

  updateWaterPointData: communityScopedProcedure
    .input(
      z.object({
        waterPointId: z.string(),
        name: z.string().optional(),
        location: z.string().optional(),
        connectionNumber: z.string().nullable().optional(),
        fixedPopulation: z.number().int().min(0).optional(),
        floatingPopulation: z.number().int().min(0).optional(),
        cadastralReference: z.string().optional(),
        notes: z.string().optional(),
        communityZoneId: z.string().optional(),
        waterDepositIds: z.array(z.string()).optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertWaterPointBelongsToScope(input.waterPointId, ctx.scope)
      await assertDepositsBelongToScope(input.waterDepositIds ?? [], ctx.scope)

      try {
        const service = CommunityFactory.waterPointDataUpdaterService()
        const result = await service.run({
          waterPointId: Id.fromString(input.waterPointId),
          updatedData: {
            name: input.name,
            location: input.location,
            connectionNumber: input.connectionNumber,
            fixedPopulation: input.fixedPopulation,
            floatingPopulation: input.floatingPopulation,
            cadastralReference: input.cadastralReference,
            notes: input.notes,
            communityZoneId: input.communityZoneId
              ? Id.fromString(input.communityZoneId)
              : undefined,
            waterDepositIds: input.waterDepositIds?.map(Id.fromString)
          }
        })
        return result
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message)
        }
        throw error
      }
    }),

  createWaterPointOnboarding: waterPointManagementProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string(),
        connectionNumber: z.string().optional(),
        communityZoneId: z.string().min(1),
        fixedPopulation: z.number().int().min(0),
        floatingPopulation: z.number().int().min(0),
        cadastralReference: z.string().min(1),
        notes: z.string().optional(),
        waterDepositIds: z.array(z.string()).optional(),
        accountName: z.string().min(1),
        nationalId: z.string().min(1),
        phone: z.string().optional(),
        accountNotes: z.string().optional(),
        meterName: z.string().min(1),
        measurementUnit: z.enum(['L', 'M3']),
        isActive: z.boolean().optional(),
        initialReading: z.string().optional(),
        initialReadingDate: z.date().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const communityId = ctx.session.user.community?.id
      if (!communityId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User has no community assigned'
        })
      }

      try {
        const service = WaterAccountFactory.waterPointOnboardingService()
        return await service.run({
          communityId: Id.fromString(communityId),
          waterPoint: {
            name: input.name,
            location: input.location,
            connectionNumber: input.connectionNumber,
            communityZoneId: input.communityZoneId,
            fixedPopulation: input.fixedPopulation,
            floatingPopulation: input.floatingPopulation,
            cadastralReference: input.cadastralReference,
            notes: input.notes,
            waterDepositIds: input.waterDepositIds
          },
          account: {
            name: input.accountName,
            nationalId: input.nationalId,
            phone: input.phone,
            notes: input.accountNotes
          },
          waterMeter: {
            name: input.meterName,
            measurementUnit: input.measurementUnit,
            isActive: input.isActive
          },
          initialReading: input.initialReading
            ? {
                reading: input.initialReading,
                date: input.initialReadingDate
              }
            : undefined
        })
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          })
        }
        throw error
      }
    })
})
