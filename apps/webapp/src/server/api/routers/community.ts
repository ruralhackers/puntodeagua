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
  getWaterPointById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = CommunityFactory.waterPointPrismaRepository()
      const waterPoint = await repo.findById(Id.fromString(input.id))
      if (!waterPoint) return null
      return waterPoint.toDto()
    })
})
