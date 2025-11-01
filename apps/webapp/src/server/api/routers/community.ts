import { Id } from '@pda/common/domain'
import { CommunityFactory } from '@pda/community'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const communityRouter = createTRPCRouter({
  getCommunityZones: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.communityZonePrismaRepository()
      const zones = await repo.findByCommunityId(Id.fromString(input.id))
      return zones.map((zone) => zone.toDto())
    }),
  getWaterPoints: protectedProcedure
    .input(z.object({ zoneIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityZonesId(input.zoneIds.map(Id.fromString))
      return waterPoints.map((waterPoint) => waterPoint.toDto())
    }),

  getWaterPointsWithAccount: protectedProcedure
    .input(z.object({ zoneIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityZonesIdWithAccount(
        input.zoneIds.map(Id.fromString)
      )
      return waterPoints
    }),

  getWaterPointsByCommunityWithAccount: protectedProcedure
    .input(z.object({ communityId: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoints = await repo.findByCommunityIdWithAccount(Id.fromString(input.communityId))
      return waterPoints
    }),
  getWaterPointById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoint = await repo.findById(Id.fromString(input.id))
      if (!waterPoint) return null
      return waterPoint.toDto()
    }),

  getWaterDepositsByCommunityId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterDepositPrismaRepository()
      const waterDeposits = await repo.findByCommunityId(Id.fromString(input.id))
      return waterDeposits.map((waterDeposit) => waterDeposit.toDto())
    }),

  getDepositsByWaterPointId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const waterPointRepo = CommunityFactory.waterPointPrismaRepository()
      const waterPoint = await waterPointRepo.findById(Id.fromString(input.id))
      if (!waterPoint || waterPoint.waterDepositIds.length === 0) return []

      const depositRepo = CommunityFactory.waterDepositPrismaRepository()
      const deposits = await depositRepo.findByIds(waterPoint.waterDepositIds)
      return deposits.map((deposit) => deposit.toDto())
    }),

  updateWaterPointDeposits: protectedProcedure
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

  updateWaterPointData: protectedProcedure
    .input(
      z.object({
        waterPointId: z.string(),
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
    })
})
