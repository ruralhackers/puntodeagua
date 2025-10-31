import { Id } from '@pda/common/domain'
import { WaterAccountFactory } from '@pda/water-account'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const waterAccountRouter = createTRPCRouter({
  getWaterMeterById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const displayDto = await repo.findByIdForDisplay(Id.fromString(input.id))
      return displayDto
    }),

  getWaterMeterReadings: protectedProcedure
    .input(z.object({ waterMeterId: z.string() }))
    .query(async ({ input }) => {
      const repo = WaterAccountFactory.waterMeterReadingPrismaRepository()
      const result = await repo.findForTable({
        page: 1,
        limit: 100,
        filters: [
          {
            field: 'waterMeterId',
            value: input.waterMeterId,
            operator: 'equals'
          }
        ],
        orderBy: {
          field: 'readingDate',
          direction: 'desc'
        }
      })
      return result.items.map((reading) => reading.toDto())
    }),

  getWaterMetersByWaterPointId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const displayDtos = await repo.findByWaterPointIdForDisplay(Id.fromString(input.id))
      return displayDtos
    }),

  getActiveWaterMetersOrderedByLastReading: protectedProcedure
    .input(z.object({ zoneIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const zoneIds = input.zoneIds.map(Id.fromString)
      const displayDtos = await repo.findActiveByCommunityZonesIdOrderedByLastReading(zoneIds)
      return displayDtos
    }),

  addWaterMeterReading: protectedProcedure
    .input(
      z.object({
        waterMeterId: z.string(),
        reading: z.string(),
        readingDate: z.date(),
        notes: z.string().nullable().optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterReadingCreatorService()

        const params = {
          waterMeterId: Id.fromString(input.waterMeterId),
          reading: input.reading,
          date: input.readingDate,
          notes: input.notes ?? undefined
        }

        const reading = await service.run(params)
        return reading.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateWaterMeterReading: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reading: z.string().optional(),
        notes: z.string().nullable().optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterReadingUpdaterService()

        const reading = await service.run({
          id: Id.fromString(input.id),
          updatedData: { reading: input.reading, notes: input.notes }
        })
        return reading.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  recalculateWaterMeterExcess: protectedProcedure
    .input(z.object({ waterMeterId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterExcessRecalculatorService()
        await service.run(Id.fromString(input.waterMeterId))
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    })
})
