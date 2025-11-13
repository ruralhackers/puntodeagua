import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import type { EntityFileRepository } from '@pda/storage'
import { WaterMeterImage } from '../../domain/entities/water-meter-image'
import type { WaterMeterImageRepository } from '../../domain/repositories/water-meter-image.repository'

export class WaterMeterImagePrismaRepository
  extends BasePrismaRepository
  implements WaterMeterImageRepository, EntityFileRepository<WaterMeterImage>
{
  protected readonly model = 'waterMeterImage'
  protected getModel() {
    return this.db[this.model]
  }

  async findById(id: Id): Promise<WaterMeterImage | undefined> {
    const image = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    if (!image) return undefined
    return WaterMeterImage.fromDto(image)
  }

  async findByWaterMeterId(waterMeterId: Id): Promise<WaterMeterImage | undefined> {
    const image = await this.getModel().findUnique({
      where: { waterMeterId: waterMeterId.toString() }
    })
    if (!image) return undefined
    return WaterMeterImage.fromDto(image)
  }

  async save(image: WaterMeterImage): Promise<void> {
    await this.getModel().upsert({
      where: { waterMeterId: image.waterMeterId.toString() },
      create: {
        id: image.id.toString(),
        waterMeterId: image.waterMeterId.toString(),
        url: image.url,
        fileName: image.fileName,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        uploadedAt: image.uploadedAt,
        externalKey: image.externalKey
      },
      update: {
        url: image.url,
        fileName: image.fileName,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        externalKey: image.externalKey
      }
    })
  }

  async delete(id: Id): Promise<void> {
    const image = await this.findById(id)
    if (!image) return
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  async findByEntityId(waterMeterId: Id): Promise<WaterMeterImage[]> {
    const image = await this.findByWaterMeterId(waterMeterId)
    return image ? [image] : []
  }
}
