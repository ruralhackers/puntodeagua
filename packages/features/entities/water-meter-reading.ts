import { Id } from 'core'
import { Decimal } from 'core/value-object/decimal'
import type { WaterMeterReadingSchema } from '../schemas/water-meter-reading.schema.ts'
import { FileAttachment } from './file-attachment.ts'

export class WaterMeterReading {
  private constructor(
    public readonly id: Id,
    public readonly waterMeterId: Id,
    public readonly reading: Decimal,
    public readonly normalizedReading: Decimal,
    public readonly readingDate: Date,
    public readonly notes?: string,
    public readonly attachments?: FileAttachment[]
  ) {}

  static create(data: WaterMeterReadingSchema) {
    return new WaterMeterReading(
      Id.create(data.id),
      Id.create(data.waterMeterId),
      Decimal.create(data.reading),
      Decimal.create(data.normalizedReading),
      data.readingDate ? new Date(data.readingDate) : new Date(),
      data.notes,
      data.attachments?.map((att) => FileAttachment.create(att)) || []
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      waterMeterId: this.waterMeterId.toString(),
      reading: this.reading.toString(),
      normalizedReading: this.normalizedReading.toString(),
      readingDate: this.readingDate.toISOString(),
      notes: this.notes,
      attachments: this.attachments?.map((att) => att.toDto()) || []
    }
  }
}
