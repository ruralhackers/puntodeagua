import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import { IncidentImage } from '../../domain/entities/incident-image'
import type { IncidentImageRepository } from '../../domain/repositories/incident-image.repository'

export class IncidentImagePrismaRepository
  extends BasePrismaRepository
  implements IncidentImageRepository
{
  protected readonly model = 'incidentImage'

  protected getModel() {
    return this.db[this.model]
  }

  async findById(id: Id): Promise<IncidentImage | undefined> {
    const image = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return image ? IncidentImage.fromDto(image) : undefined
  }

  async findByIncidentId(incidentId: Id): Promise<IncidentImage[]> {
    const images = await this.getModel().findMany({
      where: { incidentId: incidentId.toString() },
      orderBy: { uploadedAt: 'desc' }
    })
    return images.map((img: any) => IncidentImage.fromDto(img))
  }

  // For EntityFileRepository interface compatibility
  async findByEntityId(incidentId: Id): Promise<IncidentImage[]> {
    return this.findByIncidentId(incidentId)
  }

  async save(image: IncidentImage): Promise<void> {
    await this.getModel().create({
      data: {
        id: image.id.toString(),
        incidentId: image.incidentId.toString(),
        url: image.url,
        fileName: image.fileName,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        uploadedAt: image.uploadedAt,
        externalKey: image.externalKey
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  async deleteAllByIncidentId(incidentId: Id): Promise<void> {
    await this.getModel().deleteMany({
      where: { incidentId: incidentId.toString() }
    })
  }
}
