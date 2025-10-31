import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { WaterMeterReadingImage } from '../../domain/entities/water-meter-reading-image'
import type { WaterMeterReadingImageRepository } from '../../domain/repositories/water-meter-reading-image.repository'

export const fromWaterMeterReadingImagePrismaPayload = (
  payload: Prisma.WaterMeterReadingImageGetPayload<null>
) => {
  return {
    ...payload
  }
}

export class WaterMeterReadingImagePrismaRepository
  extends BasePrismaRepository
  implements WaterMeterReadingImageRepository
{
  protected readonly model = 'waterMeterReadingImage'

  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
  }

  async findById(id: Id) {
    const image = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return image
      ? WaterMeterReadingImage.fromDto(fromWaterMeterReadingImagePrismaPayload(image))
      : undefined
  }

  async findByWaterMeterReadingId(
    waterMeterReadingId: Id
  ): Promise<WaterMeterReadingImage | undefined> {
    const image = await this.getModel().findUnique({
      where: { waterMeterReadingId: waterMeterReadingId.toString() }
    })
    return image
      ? WaterMeterReadingImage.fromDto(fromWaterMeterReadingImagePrismaPayload(image))
      : undefined
  }

  async save(image: WaterMeterReadingImage) {
    await this.getModel().upsert({
      where: {
        id: image.id.toString()
      },
      create: {
        id: image.id.toString(),
        waterMeterReadingId: image.waterMeterReadingId.toString(),
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
        uploadedAt: image.uploadedAt,
        externalKey: image.externalKey
      }
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }
}

