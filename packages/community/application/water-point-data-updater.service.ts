import type { Id } from '@pda/common/domain'
import type { WaterPointRepository } from '../domain/repositories/water-point.repository'

interface UpdateWaterPointDataParams {
  waterPointId: Id
  updatedData: {
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
