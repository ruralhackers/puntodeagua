import type { Id } from '@pda/common/domain'
import type { FileMetadata } from '@pda/storage'
import { type FileDeleterService, FileEntityType, type FileUploaderService } from '@pda/storage'
import type { Incident } from '../domain/entities/incident'
import type { IncidentUpdateDto } from '../domain/entities/incident.dto'
import { IncidentImage } from '../domain/entities/incident-image'
import { IncidentNotFoundError } from '../domain/errors/incident-errors'
import type { IncidentRepository } from '../domain/repositories/incident.repository'

export interface IncidentUpdaterResult {
  incident: Incident
  imageUploadErrors?: string[]
  imageDeleteErrors?: string[]
}

export class IncidentUpdater {
  constructor(
    private readonly incidentRepository: IncidentRepository,
    private readonly fileUploaderService?: FileUploaderService,
    private readonly fileDeleterService?: FileDeleterService
  ) {}

  async run(params: {
    id: Id
    updatedIncidentData: IncidentUpdateDto
    newImages?: Array<{ file: Buffer; metadata: FileMetadata }>
    deleteImageIds?: Id[]
  }): Promise<IncidentUpdaterResult> {
    const { id, updatedIncidentData, newImages, deleteImageIds } = params

    const existingIncident = await this.incidentRepository.findById(id)
    if (!existingIncident) {
      throw new IncidentNotFoundError()
    }

    const updatedIncident = existingIncident.update({
      status: updatedIncidentData.status.toString(),
      endAt: updatedIncidentData.endAt,
      closingDescription: updatedIncidentData.closingDescription
    })

    await this.incidentRepository.save(updatedIncident)

    const imageUploadErrors: string[] = []
    const imageDeleteErrors: string[] = []

    // Delete images if requested
    if (deleteImageIds && deleteImageIds.length > 0 && this.fileDeleterService) {
      for (const imageId of deleteImageIds) {
        try {
          await this.fileDeleterService.run({
            fileId: imageId,
            entityType: FileEntityType.INCIDENT
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          imageDeleteErrors.push(`Image ${imageId.toString()}: ${errorMsg}`)
          console.error(`Failed to delete incident image ${imageId.toString()}:`, error)
        }
      }
    }

    // Upload new images if provided
    if (newImages && newImages.length > 0 && this.fileUploaderService) {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i]
        if (!image) continue
        try {
          await this.fileUploaderService.run({
            file: image.file,
            entityId: updatedIncident.id,
            entityType: FileEntityType.INCIDENT,
            metadata: image.metadata,
            storageFolder: 'incidents',
            createEntity: (uploadResult) =>
              IncidentImage.create({
                incidentId: updatedIncident.id.toString(),
                url: uploadResult.url,
                fileName: uploadResult.metadata.fileName,
                fileSize: uploadResult.metadata.fileSize,
                mimeType: uploadResult.metadata.mimeType,
                externalKey: uploadResult.externalKey
              })
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          imageUploadErrors.push(`Image ${i + 1}: ${errorMsg}`)
          console.error(`Failed to upload incident image ${i + 1}:`, error)
        }
      }
    }

    return {
      incident: updatedIncident,
      imageUploadErrors: imageUploadErrors.length > 0 ? imageUploadErrors : undefined,
      imageDeleteErrors: imageDeleteErrors.length > 0 ? imageDeleteErrors : undefined
    }
  }
}
