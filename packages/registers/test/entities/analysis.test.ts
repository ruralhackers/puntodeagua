import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Analysis } from '../../domain/entities/analysis'
import type { AnalysisDto } from '../../domain/entities/analysis.dto'
import { AnalysisType } from '../../domain/value-objects/analysis-type'

describe('Analysis', () => {
  const validCommunityId = 'clx12345678901234567890123'
  const validWaterZoneId = 'clx98765432109876543210987'
  const validWaterDepositId = 'clx11111111111111111111111'
  const validAnalyst = 'John Doe'
  const validAnalyzedAt = new Date('2024-01-15T10:30:00Z')

  describe('create()', () => {
    describe('valid creation scenarios', () => {
      it('creates chlorine_ph analysis with required ph', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'chlorine_ph',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          ph: 7.2
        }

        const analysis = Analysis.create(dto)

        expect(analysis.id).toBeInstanceOf(Id)
        expect(analysis.communityId.toString()).toBe(validCommunityId)
        expect(analysis.analysisType.equals(AnalysisType.CHLORINE_PH)).toBe(true)
        expect(analysis.analyst).toBe(validAnalyst)
        expect(analysis.analyzedAt.getTime()).toBe(validAnalyzedAt.getTime())
        expect(analysis.ph).toBe(7.2)
        expect(analysis.turbidity).toBeUndefined()
        expect(analysis.chlorine).toBeUndefined()
      })

      it('creates turbidity analysis with required turbidity', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'turbidity',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          turbidity: 2.5
        }

        const analysis = Analysis.create(dto)

        expect(analysis.analysisType.equals(AnalysisType.TURBIDITY)).toBe(true)
        expect(analysis.turbidity).toBe(2.5)
        expect(analysis.ph).toBeUndefined()
        expect(analysis.chlorine).toBeUndefined()
      })

      it('creates hardness analysis with required ph', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'hardness',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          ph: 6.8
        }

        const analysis = Analysis.create(dto)

        expect(analysis.analysisType.equals(AnalysisType.HARDNESS)).toBe(true)
        expect(analysis.ph).toBe(6.8)
        expect(analysis.turbidity).toBeUndefined()
        expect(analysis.chlorine).toBeUndefined()
      })

      it('creates complete analysis with all required values', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'complete',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          ph: 7.0,
          chlorine: 0.5,
          turbidity: 1.2
        }

        const analysis = Analysis.create(dto)

        expect(analysis.analysisType.equals(AnalysisType.COMPLETE)).toBe(true)
        expect(analysis.ph).toBe(7.0)
        expect(analysis.chlorine).toBe(0.5)
        expect(analysis.turbidity).toBe(1.2)
      })

      it('creates analysis with optional fields', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'chlorine_ph',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          ph: 7.2,
          waterZoneId: validWaterZoneId,
          waterDepositId: validWaterDepositId,
          description: 'Test analysis description'
        }

        const analysis = Analysis.create(dto)

        expect(analysis.waterZoneId?.toString()).toBe(validWaterZoneId)
        expect(analysis.waterDepositId?.toString()).toBe(validWaterDepositId)
        expect(analysis.description).toBe('Test analysis description')
      })
    })

    describe('validation error scenarios', () => {
      it('throws error for chlorine_ph analysis without ph', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'chlorine_ph',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt
        }

        expect(() => Analysis.create(dto)).toThrow('Ph is required for chlorine_ph analysis')
      })

      it('throws error for turbidity analysis without turbidity', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'turbidity',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt
        }

        expect(() => Analysis.create(dto)).toThrow('Turbidity is required for turbidity analysis')
      })

      it('throws error for hardness analysis without ph', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'hardness',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt
        }

        expect(() => Analysis.create(dto)).toThrow('Ph is required for hardness analysis')
      })

      it('throws error for complete analysis without ph', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'complete',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          chlorine: 0.5,
          turbidity: 1.2
        }

        expect(() => Analysis.create(dto)).toThrow(
          'Ph, chlorine and turbidity are required for complete analysis'
        )
      })

      it('throws error for complete analysis without chlorine', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'complete',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          ph: 7.0,
          turbidity: 1.2
        }

        expect(() => Analysis.create(dto)).toThrow(
          'Ph, chlorine and turbidity are required for complete analysis'
        )
      })

      it('throws error for complete analysis without turbidity', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'complete',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt,
          ph: 7.0,
          chlorine: 0.5
        }

        expect(() => Analysis.create(dto)).toThrow(
          'Ph, chlorine and turbidity are required for complete analysis'
        )
      })

      it('throws error for complete analysis without any measurement values', () => {
        const dto = {
          communityId: validCommunityId,
          analysisType: 'complete',
          analyst: validAnalyst,
          analyzedAt: validAnalyzedAt
        }

        expect(() => Analysis.create(dto)).toThrow(
          'Ph, chlorine and turbidity are required for complete analysis'
        )
      })
    })
  })

  describe('fromDto()', () => {
    it('creates analysis from complete DTO', () => {
      const dto: AnalysisDto = {
        id: 'clx22222222222222222222222',
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2,
        description: 'Complete analysis'
      }

      const analysis = Analysis.fromDto(dto)

      expect(analysis.id.toString()).toBe('clx22222222222222222222222')
      expect(analysis.communityId.toString()).toBe(validCommunityId)
      expect(analysis.analysisType.equals(AnalysisType.COMPLETE)).toBe(true)
      expect(analysis.analyst).toBe(validAnalyst)
      expect(analysis.analyzedAt).toBe(validAnalyzedAt)
      expect(analysis.waterZoneId?.toString()).toBe(validWaterZoneId)
      expect(analysis.waterDepositId?.toString()).toBe(validWaterDepositId)
      expect(analysis.ph).toBe(7.0)
      expect(analysis.chlorine).toBe(0.5)
      expect(analysis.turbidity).toBe(1.2)
      expect(analysis.description).toBe('Complete analysis')
    })

    it('creates analysis from DTO with optional fields as undefined', () => {
      const dto: AnalysisDto = {
        id: 'clx33333333333333333333333',
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      const analysis = Analysis.fromDto(dto)

      expect(analysis.waterZoneId).toBeUndefined()
      expect(analysis.waterDepositId).toBeUndefined()
      expect(analysis.turbidity).toBeUndefined()
      expect(analysis.chlorine).toBeUndefined()
      expect(analysis.description).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('converts entity to DTO with all fields', () => {
      const dto: AnalysisDto = {
        id: 'clx44444444444444444444444',
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2,
        description: 'Test description'
      }

      const analysis = Analysis.fromDto(dto)
      const resultDto = analysis.toDto()

      expect(resultDto).toEqual(dto)
    })

    it('converts entity to DTO with optional fields as undefined', () => {
      const dto: AnalysisDto = {
        id: 'clx55555555555555555555555',
        communityId: validCommunityId,
        analysisType: 'turbidity',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        turbidity: 2.5
      }

      const analysis = Analysis.fromDto(dto)
      const resultDto = analysis.toDto()

      expect(resultDto).toEqual(dto)
    })

    it('preserves Date objects in DTO conversion', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      })

      const dto = analysis.toDto()

      expect(dto.analyzedAt).toBeInstanceOf(Date)
      expect(dto.analyzedAt.getTime()).toBe(validAnalyzedAt.getTime())
    })
  })

  describe('data integrity', () => {
    it('preserves data through create -> toDto -> fromDto round trip', () => {
      const originalDto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2,
        description: 'Round trip test'
      }

      const analysis = Analysis.create(originalDto)
      const dto = analysis.toDto()
      const reconstructedAnalysis = Analysis.fromDto(dto)

      expect(reconstructedAnalysis.communityId.toString()).toBe(originalDto.communityId)
      expect(reconstructedAnalysis.analysisType.toString()).toBe(originalDto.analysisType)
      expect(reconstructedAnalysis.analyst).toBe(originalDto.analyst)
      expect(reconstructedAnalysis.analyzedAt.getTime()).toBe(originalDto.analyzedAt.getTime())
      expect(reconstructedAnalysis.waterZoneId?.toString()).toBe(originalDto.waterZoneId)
      expect(reconstructedAnalysis.waterDepositId?.toString()).toBe(originalDto.waterDepositId)
      expect(reconstructedAnalysis.ph).toBe(originalDto.ph)
      expect(reconstructedAnalysis.chlorine).toBe(originalDto.chlorine)
      expect(reconstructedAnalysis.turbidity).toBe(originalDto.turbidity)
      expect(reconstructedAnalysis.description).toBe(originalDto.description)
    })

    it('generates unique IDs across multiple creations', () => {
      const dto1 = {
        communityId: validCommunityId,
        analysisType: 'chlorine_ph' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      const dto2 = {
        communityId: validCommunityId,
        analysisType: 'turbidity' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        turbidity: 2.5
      }

      const analysis1 = Analysis.create(dto1)
      const analysis2 = Analysis.create(dto2)

      expect(analysis1.id.toString()).not.toBe(analysis2.id.toString())
    })
  })

  describe('property access', () => {
    it('provides read-only access to all properties', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2
      })

      // All properties should be accessible
      expect(analysis.id).toBeDefined()
      expect(analysis.communityId).toBeDefined()
      expect(analysis.analysisType).toBeDefined()
      expect(analysis.analyst).toBeDefined()
      expect(analysis.analyzedAt).toBeDefined()
      expect(analysis.ph).toBeDefined()
      expect(analysis.chlorine).toBeDefined()
      expect(analysis.turbidity).toBeDefined()

      // Properties should be read-only (TypeScript compile-time check)
      // This test verifies the properties exist and are accessible
    })

    it('handles optional properties correctly', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      })

      expect(analysis.waterZoneId).toBeUndefined()
      expect(analysis.waterDepositId).toBeUndefined()
      expect(analysis.description).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles zero values for measurements', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 0,
        chlorine: 0,
        turbidity: 0
      })

      expect(analysis.ph).toBe(0)
      expect(analysis.chlorine).toBe(0)
      expect(analysis.turbidity).toBe(0)
    })

    it('handles decimal values for measurements', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.123456,
        chlorine: 0.123456,
        turbidity: 1.987654
      })

      expect(analysis.ph).toBe(7.123456)
      expect(analysis.chlorine).toBe(0.123456)
      expect(analysis.turbidity).toBe(1.987654)
    })

    it('handles long description text', () => {
      const longDescription = 'A'.repeat(2000) // Max length according to schema

      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2,
        description: longDescription
      })

      expect(analysis.description).toBe(longDescription)
    })
  })

  describe('integration with dependencies', () => {
    it('integrates correctly with Id class', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      })

      expect(analysis.id).toBeInstanceOf(Id)
      expect(analysis.communityId).toBeInstanceOf(Id)
      expect(Id.isValidIdentifier(analysis.id.toString())).toBe(true)
      expect(Id.isValidIdentifier(analysis.communityId.toString())).toBe(true)
    })

    it('integrates correctly with AnalysisType class', () => {
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'turbidity',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        turbidity: 2.5
      })

      expect(analysis.analysisType).toBeInstanceOf(AnalysisType)
      expect(analysis.analysisType.equals(AnalysisType.TURBIDITY)).toBe(true)
      expect(analysis.analysisType.toString()).toBe('turbidity')
    })

    it('propagates errors from invalid Id format', () => {
      const dto = {
        communityId: 'invalid-id',
        analysisType: 'chlorine_ph' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      expect(() => Analysis.create(dto)).toThrow()
    })

    it('propagates errors from invalid AnalysisType', () => {
      const dto = {
        communityId: validCommunityId,
        analysisType: 'invalid_type' as never,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      expect(() => Analysis.create(dto)).toThrow()
    })
  })
})
