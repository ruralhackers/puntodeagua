import type { FileMetadata } from '@pda/storage'
import { FileEntityType, type FileUploaderService } from '@pda/storage'
import type { Incident } from '../domain/entities/incident'
import { IncidentImage } from '../domain/entities/incident-image'
import type { IncidentRepository } from '../domain/repositories/incident.repository'

export interface IncidentCreatorResult {
  incident: Incident
  imageUploadErrors?: string[]
}

export class IncidentCreator {
  constructor(
    private readonly incidentRepository: IncidentRepository,
    private readonly fileUploaderService?: FileUploaderService
  ) {}

  async run(params: {
    incident: Incident
    images?: Array<{ file: Buffer; metadata: FileMetadata }>
  }): Promise<IncidentCreatorResult> {
    const { incident, images } = params

    // Save the incident first
    await this.incidentRepository.save(incident)

    const imageUploadErrors: string[] = []

    // Upload images if provided
    if (images && images.length > 0 && this.fileUploaderService) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        if (!image) continue
        try {
          await this.fileUploaderService.run({
            file: image.file,
            entityId: incident.id,
            entityType: FileEntityType.INCIDENT,
            metadata: image.metadata,
            storageFolder: 'incidents',
            createEntity: (uploadResult) =>
              IncidentImage.create({
                incidentId: incident.id.toString(),
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
      incident,
      imageUploadErrors: imageUploadErrors.length > 0 ? imageUploadErrors : undefined
    }
  }
}
