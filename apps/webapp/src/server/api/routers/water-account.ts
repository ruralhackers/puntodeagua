import { Id } from '@pda/common/domain'
import { WaterAccountFactory } from '@pda/water-account'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const waterAccountRouter = createTRPCRouter({
  getWaterMetersByWaterPointId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const meters = await repo.findByWaterPointId(Id.fromString(input.id))
      return meters.map((meter) => meter.toDto())
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
      const service = WaterAccountFactory.waterMeterReadingCreatorService()

      const params = {
        waterMeterId: Id.fromString(input.waterMeterId),
        reading: input.reading,
        date: input.readingDate,
        notes: input.notes ?? undefined
      }

      const reading = await service.run(params)
      return reading.toDto()
    })
})
