import { Id } from '@pda/common/domain'
import type { CommunityZoneRepository, WaterPointRepository } from '@pda/community'
import { WaterPoint } from '@pda/community/domain'
import { WaterAccount } from '../domain/entities/water-account'
import { WaterMeter } from '../domain/entities/water-meter'
import type { WaterAccountRepository } from '../domain/repositories/water-account.repository'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import type { WaterMeterReadingCreator } from './water-meter-reading-creator.service'

export interface WaterPointOnboardingParams {
  communityId: Id
  waterPoint: {
    name: string
    location: string
    connectionNumber?: string | null
    communityZoneId: string
    fixedPopulation: number
    floatingPopulation: number
    cadastralReference: string
    notes?: string
    waterDepositIds?: string[]
  }
  account: {
    name: string
    nationalId: string
    phone?: string
    notes?: string
  }
  waterMeter: {
    name: string
    measurementUnit: string
    isActive?: boolean
  }
  initialReading?: {
    reading: string
    date?: Date
    notes?: string
  }
}

export interface WaterPointOnboardingResult {
  waterPointId: string
  waterAccountId: string
  waterMeterId: string
  accountReused: boolean
  initialReadingId?: string
}

export class WaterPointOnboarding {
  constructor(
    private readonly communityZoneRepository: CommunityZoneRepository,
    private readonly waterPointRepository: WaterPointRepository,
    private readonly waterAccountRepository: WaterAccountRepository,
    private readonly waterMeterRepository: WaterMeterRepository,
    private readonly waterMeterReadingCreator: WaterMeterReadingCreator
  ) {}

  async run(params: WaterPointOnboardingParams): Promise<WaterPointOnboardingResult> {
    const zone = await this.communityZoneRepository.findById(
      Id.fromString(params.waterPoint.communityZoneId)
    )
    if (!zone) {
      throw new Error('Community zone not found')
    }
    if (zone.communityId.toString() !== params.communityId.toString()) {
      throw new Error('Community zone does not belong to this community')
    }

    if (params.waterPoint.fixedPopulation < 0 || params.waterPoint.floatingPopulation < 0) {
      throw new Error('Population cannot be negative')
    }

    let accountReused = false
    let createdAccountId: Id | undefined
    let waterAccount = await this.waterAccountRepository.findByNationalIdInCommunity(
      params.account.nationalId,
      params.communityId
    )

    if (waterAccount) {
      accountReused = true
    } else {
      waterAccount = WaterAccount.create({
        name: params.account.name,
        nationalId: params.account.nationalId,
        phone: params.account.phone,
        notes: params.account.notes
      })
      await this.waterAccountRepository.save(waterAccount)
      createdAccountId = waterAccount.id
    }

    const waterPoint = WaterPoint.create({
      name: params.waterPoint.name,
      location: params.waterPoint.location,
      connectionNumber: params.waterPoint.connectionNumber?.trim() || undefined,
      communityZoneId: params.waterPoint.communityZoneId,
      fixedPopulation: params.waterPoint.fixedPopulation,
      floatingPopulation: params.waterPoint.floatingPopulation,
      cadastralReference: params.waterPoint.cadastralReference,
      notes: params.waterPoint.notes,
      waterDepositIds: params.waterPoint.waterDepositIds ?? []
    })

    try {
      await this.waterPointRepository.save(waterPoint)
    } catch (error) {
      await this.cleanupCreatedAccount(createdAccountId)
      throw error
    }

    const waterMeter = WaterMeter.create({
      name: params.waterMeter.name,
      waterAccountId: waterAccount.id.toString(),
      measurementUnit: params.waterMeter.measurementUnit,
      waterPoint: waterPoint.toDto(),
      isActive: params.waterMeter.isActive ?? true,
      lastReadingNormalizedValue: null,
      lastReadingDate: null,
      lastReadingExcessConsumption: null
    })

    try {
      await this.waterMeterRepository.save(waterMeter)
    } catch (error) {
      await this.waterPointRepository.delete(waterPoint.id)
      await this.cleanupCreatedAccount(createdAccountId)
      throw error
    }

    let initialReadingId: string | undefined
    if (params.initialReading) {
      try {
        const readingResult = await this.waterMeterReadingCreator.run({
          waterMeterId: waterMeter.id,
          reading: params.initialReading.reading,
          date: params.initialReading.date,
          notes: params.initialReading.notes
        })
        initialReadingId = readingResult.reading.id.toString()
      } catch (error) {
        await this.waterMeterRepository.delete(waterMeter.id)
        await this.waterPointRepository.delete(waterPoint.id)
        await this.cleanupCreatedAccount(createdAccountId)
        throw error
      }
    }

    return {
      waterPointId: waterPoint.id.toString(),
      waterAccountId: waterAccount.id.toString(),
      waterMeterId: waterMeter.id.toString(),
      accountReused,
      initialReadingId
    }
  }

  private async cleanupCreatedAccount(createdAccountId: Id | undefined) {
    if (!createdAccountId) return
    try {
      await this.waterAccountRepository.delete(createdAccountId)
    } catch {
      // best-effort cleanup
    }
  }
}
