import { Id } from '@pda/common/domain'
import { fileUploadInputSchema } from '@pda/storage'
import { FileMetadataCreatorService, WaterAccountFactory } from '@pda/water-account'
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
      const readings = await repo.findByWaterMeterId(Id.fromString(input.waterMeterId))
      return readings.map((reading) => reading.toDto())
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
        notes: z.string().nullable().optional(),
        image: fileUploadInputSchema.optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterReadingCreatorService()

        // Prepare image data if provided
        let imageData:
          | {
              file: Buffer
              metadata: ReturnType<typeof FileMetadataCreatorService.createFileMetadata>
            }
          | undefined
        if (input.image) {
          const buffer = Buffer.from(input.image.file)
          const fileMetadata = FileMetadataCreatorService.createFileMetadata({
            originalName: input.image.metadata.originalName,
            fileSize: input.image.metadata.fileSize,
            mimeType: input.image.metadata.mimeType
          })
          imageData = { file: buffer, metadata: fileMetadata }
        }

        const params = {
          waterMeterId: Id.fromString(input.waterMeterId),
          reading: input.reading,
          date: input.readingDate,
          notes: input.notes ?? undefined,
          image: imageData
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
        notes: z.string().nullable().optional(),
        image: fileUploadInputSchema.optional(),
        deleteImage: z.boolean().optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterReadingUpdaterService()

        // Prepare image data if provided
        let imageData:
          | {
              file: Buffer
              metadata: ReturnType<typeof FileMetadataCreatorService.createFileMetadata>
            }
          | undefined
        if (input.image) {
          const buffer = Buffer.from(input.image.file)
          const fileMetadata = FileMetadataCreatorService.createFileMetadata({
            originalName: input.image.metadata.originalName,
            fileSize: input.image.metadata.fileSize,
            mimeType: input.image.metadata.mimeType
          })
          imageData = { file: buffer, metadata: fileMetadata }
        }

        const reading = await service.run({
          id: Id.fromString(input.id),
          updatedData: { reading: input.reading, notes: input.notes },
          image: imageData,
          deleteImage: input.deleteImage
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
