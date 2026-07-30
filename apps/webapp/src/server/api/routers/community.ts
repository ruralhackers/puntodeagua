import { Id } from '@pda/common/domain'
import { CommunityFactory, WaterDeposit } from '@pda/community'
import { WaterAccountFactory } from '@pda/water-account'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isWaterMeterReaderOnly } from '@/lib/user-roles'
import { handleDomainError } from '@/server/api/error-handler'
import { assertCommunityAccess } from '@/server/api/guards/water-meter-community-guard'
import {
  createTRPCRouter,
  staffProcedure,
  waterDepositManagementProcedure,
  waterMeterReaderAllowedProcedure,
  waterPointManagementProcedure
} from '@/server/api/trpc'

export const communityRouter = createTRPCRouter({
  getCommunityZones: waterMeterReaderAllowedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (isWaterMeterReaderOnly(ctx.session.user.roles)) {
        assertCommunityAccess(input.id, ctx.session.user.community?.id)
      }
      const repo = CommunityFactory.communityZonePrismaRepository()
      const zones = await repo.findByCommunityId(Id.fromString(input.id))
      return zones.map((zone) => zone.toDto())
    }),
  getWaterPoints: staffProcedure
    .input(z.object({ zoneIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityZonesId(input.zoneIds.map(Id.fromString))
      return waterPoints.map((waterPoint) => waterPoint.toDto())
    }),

  getWaterPointsWithAccount: staffProcedure
    .input(z.object({ zoneIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityZonesIdWithAccount(
        input.zoneIds.map(Id.fromString)
      )
      return waterPoints
    }),

  getWaterPointsByCommunityWithAccount: staffProcedure
    .input(z.object({ communityId: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityIdWithAccount(Id.fromString(input.communityId))
      return waterPoints
    }),
  getWaterPointById: staffProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const repo = CommunityFactory.waterPointPrismaRepository()
    const waterPoint = await repo.findById(Id.fromString(input.id))
    if (!waterPoint) return null
    return waterPoint.toDto()
  }),

  getWaterDepositsByCommunityId: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterDepositPrismaRepository()
      const waterDeposits = await repo.findByCommunityId(Id.fromString(input.id))
      return waterDeposits.map((waterDeposit) => waterDeposit.toDto())
    }),

  getDepositsByWaterPointId: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const waterPointRepo = CommunityFactory.waterPointPrismaRepository()
      const waterPoint = await waterPointRepo.findById(Id.fromString(input.id))
      if (!waterPoint || waterPoint.waterDepositIds.length === 0) return []

      const depositRepo = CommunityFactory.waterDepositPrismaRepository()
      const deposits = await depositRepo.findByIds(waterPoint.waterDepositIds)
      return deposits.map((deposit) => deposit.toDto())
    }),

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

  updateWaterPointDeposits: staffProcedure
    .input(
      z.object({
        waterPointId: z.string(),
        depositIds: z.array(z.string())
      })
    )
    .mutation(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoint = await repo.findById(Id.fromString(input.waterPointId))
      if (!waterPoint) throw new Error('Water point not found')

      waterPoint.waterDepositIds = input.depositIds.map(Id.fromString)
      await repo.save(waterPoint)
      return waterPoint.toDto()
    }),

  updateWaterPointData: staffProcedure
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
    .mutation(async ({ input }) => {
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
