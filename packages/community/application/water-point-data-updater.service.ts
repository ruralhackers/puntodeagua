import type { Id } from '@pda/common/domain'
import type { WaterPointRepository } from '../domain/repositories/water-point.repository'

interface UpdateWaterPointDataParams {
  waterPointId: Id
  updatedData: {
    name?: string
    location?: string
    connectionNumber?: string | null
    fixedPopulation?: number
    floatingPopulation?: number
    cadastralReference?: string
    notes?: string
    communityZoneId?: Id
    waterDepositIds?: Id[]
  }
}

export class WaterPointDataUpdater {
  constructor(private waterPointRepository: WaterPointRepository) {}

  async run(params: UpdateWaterPointDataParams) {
    // Validate that the water point exists
    const waterPoint = await this.waterPointRepository.findById(params.waterPointId)
    if (!waterPoint) {
      throw new Error('Water point not found')
    }

    if (params.updatedData.name !== undefined) {
      const trimmedName = params.updatedData.name.trim()
      if (!trimmedName) {
        throw new Error('Name cannot be empty')
      }
      waterPoint.name = trimmedName
    }

    if (params.updatedData.location !== undefined) {
      waterPoint.location = params.updatedData.location.trim()
    }

    if (params.updatedData.connectionNumber !== undefined) {
      const trimmed = params.updatedData.connectionNumber?.trim()
      waterPoint.connectionNumber = trimmed ? trimmed : null
    }

    // Update the fields if provided
    if (params.updatedData.fixedPopulation !== undefined) {
      if (params.updatedData.fixedPopulation < 0) {
        throw new Error('Fixed population cannot be negative')
      }
      waterPoint.fixedPopulation = params.updatedData.fixedPopulation
    }

    if (params.updatedData.floatingPopulation !== undefined) {
      if (params.updatedData.floatingPopulation < 0) {
        throw new Error('Floating population cannot be negative')
      }
      waterPoint.floatingPopulation = params.updatedData.floatingPopulation
    }

    if (params.updatedData.cadastralReference !== undefined) {
      waterPoint.cadastralReference = params.updatedData.cadastralReference
    }

    if (params.updatedData.notes !== undefined) {
      waterPoint.notes = params.updatedData.notes
    }

    if (params.updatedData.communityZoneId !== undefined) {
      waterPoint.communityZoneId = params.updatedData.communityZoneId
    }

    if (params.updatedData.waterDepositIds !== undefined) {
      waterPoint.waterDepositIds = params.updatedData.waterDepositIds
    }

    // Save the updated water point
    await this.waterPointRepository.save(waterPoint)

    return {
      waterPointId: waterPoint.id.toString(),
      updatedFields: Object.keys(params.updatedData)
    }
  }
}
