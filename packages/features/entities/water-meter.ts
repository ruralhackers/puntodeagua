import { MeasurementUnit } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { WaterMeterSchema } from '../schemas/water-meter.schema.ts'
import type { WaterMeterReadingSchema } from '../schemas/water-meter-reading.schema.ts'
import type { WaterPointSchema } from '../schemas/water-point.schema.ts'
import { WaterMeterReading } from './water-meter-reading.ts'
import { WaterPoint } from './water-point.ts'

export class WaterMeter {
  private static readonly dailyWaterLimitLitersPerPerson = 150

  private constructor(
    public readonly id: Id,
    public name: string,
    public readonly holderId: Id,
    public readonly waterPoint: WaterPoint,
    public readonly waterZoneId: Id,
    public measurementUnit: MeasurementUnit,
    public images: string[] | [],
    public readonly waterZoneName?: string,
    public readonly lastReadingValue?: string,
    public readonly lastReadingDate?: Date,
    public readonly waterMeterReadings?: WaterMeterReading[]
  ) {}

  static create({
    name,
    holderId,
    waterPoint,
    waterZoneId,
    measurementUnit,
    images,
    waterZoneName,
    lastReadingValue,
    lastReadingDate
  }: Omit<WaterMeterSchema, 'id'>) {
    return new WaterMeter(
      Id.generateUniqueId(),
      name,
      Id.create(holderId),
      WaterPoint.fromDto(waterPoint),
      Id.create(waterZoneId),
      MeasurementUnit.create(measurementUnit),
      images || [],
      waterZoneName,
      lastReadingValue,
      lastReadingDate
    )
  }

  static fromDto(dto: WaterMeterSchema): WaterMeter {
    const readings = WaterMeter.calculateConsumption(dto.waterMeterReadings, dto.waterPoint)
    const lastReadingValue = dto.waterMeterReadings?.[0]?.reading.toString()
    const lastReadingDate = dto.waterMeterReadings?.[0]?.readingDate

    return new WaterMeter(
      Id.create(dto.id),
      dto.name,
      Id.create(dto.holderId),
      WaterPoint.fromDto(dto.waterPoint),
      Id.create(dto.waterZoneId),
      MeasurementUnit.create(dto.measurementUnit),
      dto.images || [],
      dto.waterZoneName,
      lastReadingValue,
      lastReadingDate,
      readings
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
      holderId: this.holderId.toString(),
      waterPoint: this.waterPoint.toDto(),
      waterZoneId: this.waterZoneId.toString(),
      waterZoneName: this.waterZoneName,
      measurementUnit: this.measurementUnit.toString(),
      images: this.images,
      lastReadingValue: this.lastReadingValue,
      lastReadingDate: this.lastReadingDate,
      waterMeterReadings: this.waterMeterReadings?.map((reading) => reading.toDto())
    }
  }

  private static calculateConsumption(
    readings: WaterMeterReadingSchema[],
    waterPoint: WaterPointSchema
  ): WaterMeterReading[] {
    if (!readings || readings.length === 0) return []
    return readings
      .slice()
      .reverse()
      .map((reading, index, arr) => {
        let consumption = 0
        let excessConsumption = false
        const readingDate = new Date(reading.readingDate)
        if (index > 0 && arr[index - 1]) {
          const currentValue = parseFloat(reading.normalizedReading.toString())
          const previousValue = parseFloat(arr[index - 1].normalizedReading.toString())
          consumption = currentValue - previousValue
          const beforeReadingDate = new Date(arr[index - 1].readingDate)
          const daysBetween = Math.ceil(
            (readingDate.getTime() - beforeReadingDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const totalPopulation = waterPoint.fixedPopulation + waterPoint.floatingPopulation
          const totalDailyLimit = WaterMeter.dailyWaterLimitLitersPerPerson * totalPopulation

          excessConsumption =
            daysBetween > 0 && totalPopulation > 0 && consumption / daysBetween > totalDailyLimit
        }

        return WaterMeterReading.fromDto({
          id: reading.id.toString(),
          waterMeterId: reading.waterMeterId.toString(),
          readingDate: reading.readingDate,
          reading: reading.reading.toString(),
          normalizedReading: reading.normalizedReading.toString(),
          notes: reading.notes,
          files: reading.files,
          consumption,
          excessConsumption
        })
      })
  }
}
