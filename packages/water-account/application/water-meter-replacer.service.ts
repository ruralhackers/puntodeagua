import type { Id } from '@pda/common/domain'
import { WaterMeter } from '../domain/entities/water-meter'
import {
  WaterMeterInactiveError,
  WaterMeterNotFoundError,
  WaterMeterReadingDateNotAllowedError
} from '../domain/errors/water-meter-errors'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import { MeasurementUnit } from '../domain/value-objects/measurement-unit'
import type { WaterMeterReadingCreator } from './water-meter-reading-creator.service'

export interface WaterMeterReplacerResult {
  oldWaterMeterId: string
  newWaterMeterId: string
  finalReadingCreated: boolean
  initialReadingCreated: boolean
}

export class WaterMeterReplacer {
  constructor(
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly waterMeterReadingCreator: WaterMeterReadingCreator
  ) {}

  async run(params: {
    oldWaterMeterId: Id
    newWaterMeterName: string
    measurementUnit: string
    replacementDate?: Date
    finalReading?: string
  }): Promise<WaterMeterReplacerResult> {
    const { oldWaterMeterId, newWaterMeterName, measurementUnit, replacementDate, finalReading } =
      params

    // Use current date if no replacement date provided
    const effectiveReplacementDate = replacementDate ?? new Date()

    // Validate replacement date is not in the future
    if (effectiveReplacementDate > new Date()) {
      throw new WaterMeterReadingDateNotAllowedError('Replacement date cannot be in the future')
    }

    // 1. Validate old water meter exists and is active
    const oldWaterMeter = await this.waterMeterRepository.findById(oldWaterMeterId)
    if (!oldWaterMeter) {
      throw new WaterMeterNotFoundError()
    }

    if (!oldWaterMeter.isActive) {
      throw new WaterMeterInactiveError('Water meter is already inactive and cannot be replaced')
    }

    // Validate measurement unit
    const newMeasurementUnit = MeasurementUnit.fromString(measurementUnit)

    let finalReadingCreated = false

    // 2. Create final reading for old water meter if provided
    if (finalReading) {
      await this.waterMeterReadingCreator.run({
        waterMeterId: oldWaterMeter.id,
        reading: finalReading,
        date: effectiveReplacementDate,
        notes: 'Lectura final antes del reemplazo del contador'
      })
      finalReadingCreated = true
    }

    // 3. Deactivate old water meter
    oldWaterMeter.deactivate()
    await this.waterMeterRepository.save(oldWaterMeter)

    // 4. Create new water meter
    const newWaterMeter = WaterMeter.create({
      name: newWaterMeterName,
      waterAccountId: oldWaterMeter.waterAccountId.toString(),
      measurementUnit: newMeasurementUnit.toString(),
      waterPoint: oldWaterMeter.waterPoint.toDto(),
      isActive: true
    })
    await this.waterMeterRepository.save(newWaterMeter)

    // 5. Create initial reading with value 0 for new water meter
    await this.waterMeterReadingCreator.run({
      waterMeterId: newWaterMeter.id,
      reading: '0',
      date: effectiveReplacementDate,
      notes: 'Lectura inicial del nuevo contador'
    })

    return {
      oldWaterMeterId: oldWaterMeter.id.toString(),
      newWaterMeterId: newWaterMeter.id.toString(),
      finalReadingCreated,
      initialReadingCreated: true
    }
  }
}
