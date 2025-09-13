import { MeasurementUnit } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { CommunityDto } from '../../community/entities/community.dto.ts'
import type { WaterPointDto } from '../../community/entities/water-point.dto.ts'
import { WaterPoint } from '../../community/entities/water-point.ts'
import { WaterZone } from '../../community/entities/water-zone.ts'
import type { WaterMeterDto } from './water-meter.dto.ts'
import type { WaterMeterReadingDto } from './water-meter-reading.dto.ts'
import { WaterMeterReading } from './water-meter-reading.ts'

export class WaterMeter {
  private constructor(
    public readonly id: Id,
    public name: string,
    public readonly holderId: Id,
    public readonly waterPoint: WaterPoint,
    public readonly waterZone: WaterZone,
    public measurementUnit: MeasurementUnit,
    public images: string[] | [],
    public readonly lastReadingValue?: string,
    public readonly lastReadingDate?: Date,
    public readonly waterMeterReadings?: WaterMeterReading[]
  ) {}

  static create({
    name,
    holderId,
    waterPoint,
    waterZone,
    measurementUnit,
    images,
    lastReadingValue,
    lastReadingDate
  }: Omit<WaterMeterDto, 'id'>) {
    return new WaterMeter(
      Id.generateUniqueId(),
      name,
      Id.create(holderId),
      WaterPoint.fromDto(waterPoint),
      WaterZone.fromDto(waterZone),
      MeasurementUnit.create(measurementUnit),
      images || [],
      lastReadingValue,
      lastReadingDate
    )
  }

  static fromDto(dto: WaterMeterDto): WaterMeter {
    const readings = WaterMeter.calculateConsumption(
      dto.waterZone?.community,
      dto.waterPoint,
      dto.waterMeterReadings
    )
    const lastReadingValue = dto.waterMeterReadings?.[0]?.reading.toString()
    const lastReadingDate = dto.waterMeterReadings?.[0]?.readingDate

    return new WaterMeter(
      Id.create(dto.id),
      dto.name,
      Id.create(dto.holderId),
      WaterPoint.fromDto(dto.waterPoint),
      WaterZone.fromDto(dto.waterZone),
      MeasurementUnit.create(dto.measurementUnit),
      dto.images || [],
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
      waterZone: this.waterZone.toDto(),
      measurementUnit: this.measurementUnit.toString(),
      images: this.images,
      lastReadingValue: this.lastReadingValue,
      lastReadingDate: this.lastReadingDate,
      waterMeterReadings: this.waterMeterReadings?.map((reading) => reading.toDto())
    }
  }

  private static calculateConsumption(
    community: CommunityDto,
    waterPoint: WaterPointDto,
    readings?: WaterMeterReadingDto[]
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
          const totalDailyLimit = community?.dailyWaterLimitLitersPerPerson * totalPopulation

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
