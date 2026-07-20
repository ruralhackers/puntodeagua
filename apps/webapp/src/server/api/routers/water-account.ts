import { Id } from '@pda/common/domain'
import { FileMetadataCreatorService, fileUploadInputSchema } from '@pda/storage'
import { WaterAccountFactory, waterAccountUpdateSchema } from '@pda/water-account'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isWaterMeterReaderOnly } from '@/lib/user-roles'
import { handleDomainError } from '@/server/api/error-handler'
import {
  assertCommunityAccess,
  assertWaterMeterBelongsToUserCommunity,
  assertZoneIdsBelongToUserCommunity
} from '@/server/api/guards/water-meter-community-guard'
import {
  createTRPCRouter,
  staffProcedure,
  waterMeterReaderAllowedProcedure
} from '@/server/api/trpc'

export const waterAccountRouter = createTRPCRouter({
  getWaterMeterById: waterMeterReaderAllowedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (isWaterMeterReaderOnly(ctx.session.user.roles)) {
        await assertWaterMeterBelongsToUserCommunity(input.id, ctx.session.user.community?.id)
      }

      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const displayDto = await repo.findByIdForDisplay(Id.fromString(input.id))
      return displayDto
    }),

  getWaterMeterReadings: waterMeterReaderAllowedProcedure
    .input(z.object({ waterMeterId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (isWaterMeterReaderOnly(ctx.session.user.roles)) {
        await assertWaterMeterBelongsToUserCommunity(
          input.waterMeterId,
          ctx.session.user.community?.id
        )
      }

      const repo = WaterAccountFactory.waterMeterReadingPrismaRepository()
      const readings = await repo.findByWaterMeterId(Id.fromString(input.waterMeterId))
      return readings.map((reading) => reading.toDto())
    }),

  getWaterMetersByWaterPointId: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const displayDtos = await repo.findByWaterPointIdForDisplay(Id.fromString(input.id))
      return displayDtos
    }),

  getActiveWaterMetersOrderedByLastReading: waterMeterReaderAllowedProcedure
    .input(
      z.object({
        zoneIds: z.array(z.string()),
        includeInactive: z.boolean().optional().default(false)
      })
    )
    .query(async ({ input, ctx }) => {
      if (isWaterMeterReaderOnly(ctx.session.user.roles)) {
        await assertZoneIdsBelongToUserCommunity(input.zoneIds, ctx.session.user.community?.id)
      }

      const repo = WaterAccountFactory.waterMeterPrismaRepository()
      const zoneIds = input.zoneIds.map(Id.fromString)

      // Si includeInactive es true, usar método que devuelva todos
      if (input.includeInactive) {
        const displayDtos = await repo.findByCommunityZonesIdOrderedByLastReading(zoneIds)
        return displayDtos
      }

      const displayDtos = await repo.findActiveByCommunityZonesIdOrderedByLastReading(zoneIds)
      return displayDtos
    }),

  addWaterMeterReading: waterMeterReaderAllowedProcedure
    .input(
      z.object({
        waterMeterId: z.string(),
        reading: z.string(),
        readingDate: z.date(),
        notes: z.string().nullable().optional(),
        image: fileUploadInputSchema.optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await assertWaterMeterBelongsToUserCommunity(
          input.waterMeterId,
          ctx.session.user.community?.id
        )

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

        const result = await service.run(params)
        return {
          reading: result.reading.toDto(),
          imageUploadFailed: result.imageUploadFailed,
          imageError: result.imageError
        }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateWaterMeterReading: staffProcedure
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

        const result = await service.run({
          id: Id.fromString(input.id),
          updatedData: { reading: input.reading, notes: input.notes },
          image: imageData,
          deleteImage: input.deleteImage
        })
        return {
          reading: result.reading.toDto(),
          imageUploadFailed: result.imageUploadFailed,
          imageDeleteFailed: result.imageDeleteFailed,
          imageError: result.imageError
        }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  deleteWaterMeterReading: staffProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterReadingDeleterService()
        await service.run(Id.fromString(input.id))
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  recalculateWaterMeterExcess: staffProcedure
    .input(z.object({ waterMeterId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterExcessRecalculatorService()
        await service.run(Id.fromString(input.waterMeterId))
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateWaterMeterImage: staffProcedure
    .input(
      z.object({
        waterMeterId: z.string(),
        image: fileUploadInputSchema.optional(),
        deleteImage: z.boolean().optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterImageUpdaterService()

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

        const result = await service.run({
          waterMeterId: Id.fromString(input.waterMeterId),
          image: imageData,
          deleteImage: input.deleteImage
        })
        return result
      } catch (error) {
        handleDomainError(error)
      }
    }),

  replaceWaterMeter: staffProcedure
    .input(
      z.object({
        oldWaterMeterId: z.string(),
        newWaterMeterName: z.string(),
        measurementUnit: z.string(),
        replacementDate: z.date().optional(),
        finalReading: z.string().optional(),
        image: fileUploadInputSchema.optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterReplacerService()

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

        const result = await service.run({
          oldWaterMeterId: Id.fromString(input.oldWaterMeterId),
          newWaterMeterName: input.newWaterMeterName,
          measurementUnit: input.measurementUnit,
          replacementDate: input.replacementDate,
          finalReading: input.finalReading,
          image: imageData
        })
        return result
      } catch (error) {
        handleDomainError(error)
      }
    }),

  getAllWaterAccounts: staffProcedure.query(async () => {
    const repo = WaterAccountFactory.waterAccountPrismaRepository()
    const accounts = await repo.findAll()
    return accounts.map((account) => account.toDto())
  }),

  getWaterAccountsByCommunityId: staffProcedure
    .input(z.object({ communityId: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityAccess(input.communityId, ctx.session.user.community?.id)
      const repo = WaterAccountFactory.waterAccountPrismaRepository()
      const accounts = await repo.findByCommunityId(Id.fromString(input.communityId))
      return accounts.map((account) => account.toDto())
    }),

  getWaterAccountById: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const communityId = ctx.session.user.community?.id
      if (!communityId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User has no community assigned' })
      }
      const repo = WaterAccountFactory.waterAccountPrismaRepository()
      const belongs = await repo.belongsToCommunity(
        Id.fromString(input.id),
        Id.fromString(communityId)
      )
      if (!belongs) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Community access denied' })
      }
      const account = await repo.findById(Id.fromString(input.id))
      return account?.toDto() ?? null
    }),

  updateWaterAccount: staffProcedure
    .input(
      z.object({
        id: z.string(),
        data: waterAccountUpdateSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const communityId = ctx.session.user.community?.id
        if (!communityId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User has no community assigned' })
        }
        const repo = WaterAccountFactory.waterAccountPrismaRepository()
        const belongs = await repo.belongsToCommunity(
          Id.fromString(input.id),
          Id.fromString(communityId)
        )
        if (!belongs) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Community access denied' })
        }

        const service = WaterAccountFactory.waterAccountUpdaterService()
        const account = await service.run({
          id: Id.fromString(input.id),
          data: input.data
        })
        return account.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  changeWaterMeterOwner: staffProcedure
    .input(
      z.object({
        waterMeterId: z.string(),
        newWaterAccountId: z.string().optional(),
        newWaterAccountData: z
          .object({
            name: z.string(),
            nationalId: z.string(),
            phone: z.string().optional(),
            notes: z.string().optional()
          })
          .optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = WaterAccountFactory.waterMeterOwnerChangerService()
        const result = await service.run({
          waterMeterId: Id.fromString(input.waterMeterId),
          newWaterAccountId: input.newWaterAccountId
            ? Id.fromString(input.newWaterAccountId)
            : undefined,
          newWaterAccountData: input.newWaterAccountData
        })
        return result
      } catch (error) {
        handleDomainError(error)
      }
    }),

  exportWaterMeterReadings: staffProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        communityId: z.string().optional(),
        waterMeterId: z.string().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { CommunityFactory } = await import('@pda/community')
        const { periodConsumptionStats } = await import('@pda/water-account')

        // Get community ID from user session or input
        const communityId = input.communityId
          ? Id.fromString(input.communityId)
          : ctx.session?.user?.community?.id
            ? Id.fromString(ctx.session.user.community.id)
            : undefined

        if (!communityId) {
          throw new Error('No se pudo determinar la comunidad para la exportación')
        }

        // Get community to access waterLimitRule
        const communityRepo = CommunityFactory.communityPrismaRepository()
        const community = await communityRepo.findById(communityId)

        if (!community) {
          throw new Error('Comunidad no encontrada')
        }

        // Get all water meters for this community with readings in range
        const waterMeterRepo = WaterAccountFactory.waterMeterPrismaRepository()
        const waterMeterReadingRepo = WaterAccountFactory.waterMeterReadingPrismaRepository()
        const communityZoneRepo = CommunityFactory.communityZonePrismaRepository()

        // Get all zones for this community
        const zones = await communityZoneRepo.findByCommunityId(communityId)
        const zoneIds = zones.map((zone) => zone.id)

        // Get only active water meters
        let waterMeters =
          await waterMeterRepo.findActiveByCommunityZonesIdOrderedByLastReading(zoneIds)

        if (input.waterMeterId) {
          await assertWaterMeterBelongsToUserCommunity(
            input.waterMeterId,
            communityId.toString()
          )
          waterMeters = waterMeters.filter((meter) => meter.id === input.waterMeterId)
          if (waterMeters.length === 0) {
            throw new Error('Contador no encontrado o inactivo')
          }
        }

        // For each water meter, get readings in the date range
        const result = await Promise.all(
          waterMeters.map(async (waterMeter) => {
            const allReadings = await waterMeterReadingRepo.findByWaterMeterId(
              Id.fromString(waterMeter.id)
            )

            // Filter readings by date range and sort by date ascending
            const readingsInRange = allReadings
              .filter((reading) => {
                const readingDate = reading.readingDate
                return readingDate >= input.startDate && readingDate <= input.endDate
              })
              .sort((a, b) => a.readingDate.getTime() - b.readingDate.getTime())
              .map((reading) => ({
                normalizedReading: reading.normalizedReading,
                readingDate: reading.readingDate
              }))

            // Get zone name
            const zone = zones.find(
              (z) => z.id.toString() === waterMeter.waterPoint.communityZoneId
            )

            const stats = periodConsumptionStats(readingsInRange)

            return {
              id: waterMeter.id,
              name: waterMeter.waterPoint.name,
              waterAccountName: waterMeter.waterAccountName,
              isActive: waterMeter.isActive,
              readings: readingsInRange,
              totalConsumption: stats.totalConsumption,
              days: stats.days,
              averageConsumptionPerDay: stats.averageConsumptionPerDay,
              waterPoint: {
                name: waterMeter.waterPoint.name,
                connectionNumber: waterMeter.waterPoint.connectionNumber ?? null,
                fixedPopulation: waterMeter.waterPoint.fixedPopulation,
                floatingPopulation: waterMeter.waterPoint.floatingPopulation
              },
              waterLimitRule: community.waterLimitRule.toDto(),
              communityZone: {
                name: zone?.name ?? 'Desconocida'
              }
            }
          })
        )

        return result
      } catch (error) {
        handleDomainError(error)
      }
    })
})
