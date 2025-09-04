import type { Command } from 'core'
import { Id } from 'core'
import type { WaterMeterReadingRepository } from 'features'
import { WaterMeterReading } from 'features/entities/water-meter-reading'
import type { CreateWaterMeterReadingDto } from 'features/schemas/water-meter-reading.schema'
import type { FileStorageService } from '../../files/infrastructure/file-storage.service'

export class CreateWaterMeterReadingCmd implements Command<CreateWaterMeterReadingDto, string> {
  static readonly ID = 'CreateWaterMeterReadingCmd'

  constructor(
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly fileStorageService: FileStorageService // ← AGREGADO
  ) {}

  async handle(data: CreateWaterMeterReadingDto): Promise<string> {
    // Procesar archivos si existen
    const attachments = []

    if (data.files && data.files.length > 0) {
      for (const file of data.files) {
        const fileExtension = this.getFileExtension(file.originalName)
        const fileName = `reading_${Id.generateUniqueId()}.${fileExtension}`

        // Guardar archivo
        const path = await this.fileStorageService.saveFile(file.buffer, fileName)

        // Crear attachment
        const attachment = {
          id: Id.generateUniqueId().toString(),
          originalName: file.originalName,
          fileName,
          mimeType: file.mimeType,
          size: file.size,
          path
        }

        attachments.push(attachment)
      }
    }

    // Crear la lectura del medidor
    const reading = WaterMeterReading.create({
      id: Id.generateUniqueId().toString(),
      waterMeterId: data.waterMeterId,
      reading: data.reading,
      readingDate: data.readingDate,
      notes: data.notes,
      attachments
    })

    // Guardar en base de datos
    await this.waterMeterReadingRepository.save(reading)

    return reading.id.toString()
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'bin'
  }
}
