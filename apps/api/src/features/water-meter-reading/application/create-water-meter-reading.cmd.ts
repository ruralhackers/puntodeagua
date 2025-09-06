import type { Command } from 'core'
import { Id, MeasurementUnit } from 'core'
import type {
  WaterMeterReadingDto,
  WaterMeterReadingRepository,
  WaterMeterRepository
} from 'features'
import { WaterMeterReading } from 'features'
import type { FileUploadService } from '../../../infrastructure/file-upload/file-upload.service'

// Define el tipo para archivos de multer
interface MulterFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
  filename?: string
}

export interface CreateWaterMeterReadingCommand {
  waterMeterId: string
  reading: string
  readingDate: Date
  notes?: string
  files?: MulterFile[]
  uploadedBy: string
}

export class CreateWaterMeterReadingCmd
  implements Command<CreateWaterMeterReadingCommand, WaterMeterReadingDto>
{
  static readonly ID = Symbol('CreateWaterMeterReadingCmd')

  constructor(
    private readonly waterMeterReadingRepository: WaterMeterReadingRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly waterMeterRepository: WaterMeterRepository
  ) {}

  async handle(command: CreateWaterMeterReadingCommand): Promise<WaterMeterReadingDto> {
    console.log('🔍 Creating water meter reading...', { command })

    // 1. Obtener el water meter para conocer su unidad de medida
    const waterMeter = await this.waterMeterRepository.findById(Id.create(command.waterMeterId))
    if (!waterMeter) {
      throw new Error(`Water meter with id ${command.waterMeterId} not found`)
    }

    // we need to check the last reading of the water meter, and validate if the reading is greater than the last reading
    const lastReading = await this.waterMeterReadingRepository.findLastReadingFromWaterMeterId(
      Id.create(command.waterMeterId)
    )
    if (lastReading && parseFloat(command.reading) <= parseFloat(lastReading.reading.toString())) {
      throw new Error(`Reading must be greater than the last reading`)
    }

    // 2. Normalizar la lectura: si está en M3, convertir a litros
    const normalizedReading = waterMeter.measurementUnit.equals(MeasurementUnit.M3)
      ? (parseFloat(command.reading) * 1000).toString()
      : command.reading

    // 3. Crear la entidad WaterMeterReading
    const waterMeterReading = WaterMeterReading.create({
      id: Id.generateUniqueId().toString(),
      waterMeterId: command.waterMeterId,
      reading: command.reading,
      normalizedReading,
      readingDate: command.readingDate,
      notes: command.notes,
      files: [] // Inicialmente sin archivos
    })

    // 2. Si hay archivos, subirlos y asociarlos
    if (command.files && command.files.length > 0) {
      const uploadedFiles = []

      for (const file of command.files) {
        try {
          const uploadedFile = await this.fileUploadService.uploadFile(file.buffer, {
            filename: file.filename || `file-${Date.now()}`,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            entityType: 'water-meter-reading',
            entityId: waterMeterReading.id.toString(),
            uploadedBy: command.uploadedBy
          })

          uploadedFiles.push(uploadedFile)
        } catch (error) {
          console.error(`Error uploading file ${file.originalname}:`, error)
          // Continuar con otros archivos, no fallar todo el proceso
        }
      }

      // Asignar archivos subidos al reading
      if (uploadedFiles.length > 0) {
        // Crear nueva instancia con archivos
        const readingWithFiles = WaterMeterReading.create({
          id: waterMeterReading.id.toString(),
          waterMeterId: command.waterMeterId,
          reading: command.reading,
          normalizedReading,
          readingDate: command.readingDate,
          notes: command.notes,
          files: uploadedFiles.map((file) => ({
            id: file.id.toString(),
            filename: file.filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            url: file.url,
            bucket: file.bucket,
            key: file.key,
            entityType: file.entityType,
            entityId: file.entityId,
            uploadedBy: file.uploadedBy.toString(),
            createdAt: file.createdAt
          }))
        })

        // Guardar en base de datos
        await this.waterMeterReadingRepository.save(readingWithFiles)

        return readingWithFiles.toDto()
      }
    }

    // 3. Guardar reading sin archivos (si no hay archivos o fallaron todos)
    await this.waterMeterReadingRepository.save(waterMeterReading)

    return waterMeterReading.toDto()
  }
}
