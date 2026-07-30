import { Id } from '@pda/common/domain'
import { RegistersFactory } from '@pda/registers'
import { Incident } from '@pda/registers/domain/entities/incident'
import { incidentSchema } from '@pda/registers/domain/entities/incident.dto'
import {
  FileEntityType,
  type FileMetadata,
  FileMetadataCreatorService,
  fileUploadInputSchema
} from '@pda/storage'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import {
  assertCommunityInScope,
  assertIncidentBelongsToScope,
  assertIncidentImageBelongsToScope
} from '@/server/api/guards/community-scope.guards'
import { communityScopedProcedure, createTRPCRouter, requireCommunityId } from '@/server/api/trpc'

export const incidentsRouter = createTRPCRouter({
  // getIncidents removed: it returned every community's incidents with no
  // scope, and no screen called it.

  getIncidentsByCommunityId: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      assertCommunityInScope(input.id, ctx.scope)

      const repo = RegistersFactory.incidentPrismaRepository()
      const incidents = await repo.findByCommunityId(Id.fromString(input.id))
      return incidents.map((incident) => incident.toDto())
    }),

  getIncidentById: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      await assertIncidentBelongsToScope(input.id, ctx.scope)

      const repo = RegistersFactory.incidentPrismaRepository()
      const imageRepo = RegistersFactory.incidentImagePrismaRepository()

      const incident = await repo.findById(Id.fromString(input.id))
      if (!incident) return null

      const images = await imageRepo.findByIncidentId(Id.fromString(input.id))

      return {
        ...incident.toDto(),
        images: images.map((img) => img.toDto())
      }
    }),

  addIncident: communityScopedProcedure
    .input(
      incidentSchema.omit({ id: true }).extend({
        images: z.array(fileUploadInputSchema).optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      assertCommunityInScope(input.communityId, ctx.scope)

      try {
        const service = RegistersFactory.incidentCreatorService()

        const incident = Incident.create({
          title: input.title,
          reporterName: input.reporterName,
          startAt: input.startAt,
          communityId: input.communityId,
          communityZoneId: input.communityZoneId,
          waterDepositId: input.waterDepositId,
          waterPointId: input.waterPointId,
          description: input.description,
          endAt: input.endAt,
          status: 'open'
        })

        // Process images if provided
        let imageData: Array<{ file: Buffer; metadata: FileMetadata }> | undefined
        if (input.images && input.images.length > 0) {
          imageData = input.images.map((img) => ({
            file: Buffer.from(img.file),
            metadata: FileMetadataCreatorService.createFileMetadata({
              originalName: img.metadata.originalName,
              fileSize: img.metadata.fileSize,
              mimeType: img.metadata.mimeType
            })
          }))
        }

        const result = await service.run({ incident, images: imageData })

        return {
          incident: result.incident.toDto(),
          imageUploadErrors: result.imageUploadErrors
        }
      } catch (error) {
        // Handle domain errors with Spanish messages
        handleDomainError(error)
      }
    }),

  updateIncident: communityScopedProcedure
    .input(
      incidentSchema.extend({
        newImages: z.array(fileUploadInputSchema).optional(),
        deleteImageIds: z.array(z.string()).optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertIncidentBelongsToScope(input.id, ctx.scope)

      try {
        const service = RegistersFactory.incidentUpdaterService()

        // Process new images if provided
        let newImageData: Array<{ file: Buffer; metadata: FileMetadata }> | undefined
        if (input.newImages && input.newImages.length > 0) {
          newImageData = input.newImages.map((img) => ({
            file: Buffer.from(img.file),
            metadata: FileMetadataCreatorService.createFileMetadata({
              originalName: img.metadata.originalName,
              fileSize: img.metadata.fileSize,
              mimeType: img.metadata.mimeType
            })
          }))
        }

        const result = await service.run({
          id: Id.fromString(input.id),
          updatedIncidentData: {
            status: input.status,
            endAt: input.endAt,
            closingDescription: input.closingDescription
          },
          newImages: newImageData,
          deleteImageIds: input.deleteImageIds?.map((id) => Id.fromString(id))
        })

        return {
          incident: result.incident.toDto(),
          imageUploadErrors: result.imageUploadErrors,
          imageDeleteErrors: result.imageDeleteErrors
        }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  deleteIncident: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertIncidentBelongsToScope(input.id, ctx.scope)

      const repo = RegistersFactory.incidentPrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    }),

  exportIncidents: communityScopedProcedure
    .input(
      z.object({
        startDate: z.string().transform((str) => new Date(str)),
        endDate: z.string().transform((str) => new Date(str)),
        status: z.enum(['open', 'closed', 'all']).optional().default('all'),
        communityId: z.string().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const repo = RegistersFactory.incidentPrismaRepository()

        // Si no se proporciona communityId, usar la del usuario autenticado
        if (input.communityId) {
          assertCommunityInScope(input.communityId, ctx.scope)
        }
        const communityId = Id.fromString(requireCommunityId(ctx.scope, input.communityId))

        const filters: {
          communityId: Id
          startDate?: Date
          endDate?: Date
          status?: 'open' | 'closed'
        } = {
          communityId,
          startDate: input.startDate,
          endDate: input.endDate
        }

        // Only add status filter if not 'all'
        if (input.status !== 'all') {
          filters.status = input.status
        }

        const incidents = await repo.findByFilters(filters)

        return incidents.map((incident) => incident.toDto())
      } catch (error) {
        handleDomainError(error)
      }
    }),

  deleteIncidentImage: communityScopedProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertIncidentImageBelongsToScope(input.imageId, ctx.scope)

      try {
        const service = RegistersFactory.fileDeleterService()
        await service.run({
          fileId: Id.fromString(input.imageId),
          entityType: FileEntityType.INCIDENT
        })
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    })
})
