import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Analysis } from '../../domain/entities/analysis'
import type { AnalysisDto } from '../../domain/entities/analysis.dto'
import {
  AnalysisCompleteMeasurementsRequiredError,
  AnalysisHardnessPhRequiredError,
  AnalysisPhRequiredError,
  AnalysisTurbidityRequiredError
} from '../../domain/errors/analysis-errors'
import { AnalysisType } from '../../domain/value-objects/analysis-type'

describe('Analysis', () => {
  const validCommunityId = 'clx12345678901234567890123'
  const validCommunityZoneId = 'clx98765432109876543210987'
  const validWaterDepositId = 'clx11111111111111111111111'
  const validAnalyst = 'John Doe'
  const validAnalyzedAt = new Date('2024-01-15T10:30:00Z')

  describe('create()', () => {
    it('should throw error for chlorine_ph analysis without ph', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'chlorine_ph' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisPhRequiredError)
    })

    it('should throw error for turbidity analysis without turbidity', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'turbidity' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisTurbidityRequiredError)
    })

    it('should throw error for hardness analysis without ph', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'hardness' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisHardnessPhRequiredError)
    })

    it('should throw error for complete analysis without ph', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        chlorine: 0.5,
        turbidity: 1.2
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisCompleteMeasurementsRequiredError)
    })

    it('should throw error for complete analysis without chlorine', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.0,
        turbidity: 1.2
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisCompleteMeasurementsRequiredError)
    })

    it('should throw error for complete analysis without turbidity', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.0,
        chlorine: 0.5
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisCompleteMeasurementsRequiredError)
    })

    it('should throw error for complete analysis without any measurement values', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow(AnalysisCompleteMeasurementsRequiredError)
    })

    it('should create chlorine_ph analysis with required ph', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'chlorine_ph' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      // Act
      const analysis = Analysis.create(dto)

      // Assert
      expect(analysis.id).toBeInstanceOf(Id)
      expect(analysis.communityId.toString()).toBe(validCommunityId)
      expect(analysis.analysisType.equals(AnalysisType.CHLORINE_PH)).toBe(true)
      expect(analysis.analyst).toBe(validAnalyst)
      expect(analysis.analyzedAt.getTime()).toBe(validAnalyzedAt.getTime())
      expect(analysis.ph).toBe(7.2)
      expect(analysis.turbidity).toBeUndefined()
      expect(analysis.chlorine).toBeUndefined()
    })

    it('should create turbidity analysis with required turbidity', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'turbidity' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        turbidity: 2.5
      }

      // Act
      const analysis = Analysis.create(dto)

      // Assert
      expect(analysis.analysisType.equals(AnalysisType.TURBIDITY)).toBe(true)
      expect(analysis.turbidity).toBe(2.5)
      expect(analysis.ph).toBeUndefined()
      expect(analysis.chlorine).toBeUndefined()
    })

    it('should create hardness analysis with required ph', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'hardness' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 6.8
      }

      // Act
      const analysis = Analysis.create(dto)

      // Assert
      expect(analysis.analysisType.equals(AnalysisType.HARDNESS)).toBe(true)
      expect(analysis.ph).toBe(6.8)
      expect(analysis.turbidity).toBeUndefined()
      expect(analysis.chlorine).toBeUndefined()
    })

    it('should create complete analysis with all required values', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2
      }

      // Act
      const analysis = Analysis.create(dto)

      // Assert
      expect(analysis.analysisType.equals(AnalysisType.COMPLETE)).toBe(true)
      expect(analysis.ph).toBe(7.0)
      expect(analysis.chlorine).toBe(0.5)
      expect(analysis.turbidity).toBe(1.2)
    })

    it('should create analysis with optional fields', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'chlorine_ph' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2,
        communityZoneId: validCommunityZoneId,
        waterDepositId: validWaterDepositId,
        description: 'Test analysis description'
      }

      // Act
      const analysis = Analysis.create(dto)

      // Assert
      expect(analysis.communityZoneId?.toString()).toBe(validCommunityZoneId)
      expect(analysis.waterDepositId?.toString()).toBe(validWaterDepositId)
      expect(analysis.description).toBe('Test analysis description')
    })
  })

  describe('fromDto()', () => {
    it('should create analysis from complete DTO', () => {
      // Arrange
      const dto: AnalysisDto = {
        id: 'clx22222222222222222222222',
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        communityZoneId: validCommunityZoneId,
        waterDepositId: validWaterDepositId,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2,
        description: 'Complete analysis'
      }

      // Act
      const analysis = Analysis.fromDto(dto)

      // Assert
      expect(analysis.id.toString()).toBe('clx22222222222222222222222')
      expect(analysis.communityId.toString()).toBe(validCommunityId)
      expect(analysis.analysisType.equals(AnalysisType.COMPLETE)).toBe(true)
      expect(analysis.analyst).toBe(validAnalyst)
      expect(analysis.analyzedAt).toBe(validAnalyzedAt)
      expect(analysis.communityZoneId?.toString()).toBe(validCommunityZoneId)
      expect(analysis.waterDepositId?.toString()).toBe(validWaterDepositId)
      expect(analysis.ph).toBe(7.0)
      expect(analysis.chlorine).toBe(0.5)
      expect(analysis.turbidity).toBe(1.2)
      expect(analysis.description).toBe('Complete analysis')
    })

    it('should create analysis from DTO with optional fields as undefined', () => {
      // Arrange
      const dto: AnalysisDto = {
        id: 'clx33333333333333333333333',
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      // Act
      const analysis = Analysis.fromDto(dto)

      // Assert
      expect(analysis.communityZoneId).toBeUndefined()
      expect(analysis.waterDepositId).toBeUndefined()
      expect(analysis.turbidity).toBeUndefined()
      expect(analysis.chlorine).toBeUndefined()
      expect(analysis.description).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('should convert entity to DTO with all fields', () => {
      // Arrange
      const dto: AnalysisDto = {
        id: 'clx44444444444444444444444',
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        communityZoneId: validCommunityZoneId,
        waterDepositId: validWaterDepositId,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2,
        description: 'Test description'
      }
      const analysis = Analysis.fromDto(dto)

      // Act
      const resultDto = analysis.toDto()

      // Assert
      expect(resultDto).toEqual(dto)
    })

    it('should convert entity to DTO with optional fields as undefined', () => {
      // Arrange
      const dto: AnalysisDto = {
        id: 'clx55555555555555555555555',
        communityId: validCommunityId,
        analysisType: 'turbidity',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        turbidity: 2.5
      }
      const analysis = Analysis.fromDto(dto)

      // Act
      const resultDto = analysis.toDto()

      // Assert
      expect(resultDto).toEqual(dto)
    })

    it('should preserve Date objects in DTO conversion', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      })

      // Act
      const dto = analysis.toDto()

      // Assert
      expect(dto.analyzedAt).toBeInstanceOf(Date)
      expect(dto.analyzedAt.getTime()).toBe(validAnalyzedAt.getTime())
    })
  })

  describe('data integrity', () => {
    it('should preserve data through create -> toDto -> fromDto round trip', () => {
      // Arrange
      const originalDto = {
        communityId: validCommunityId,
        analysisType: 'complete' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        communityZoneId: validCommunityZoneId,
        waterDepositId: validWaterDepositId,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2,
        description: 'Round trip test'
      }

      // Act
      const analysis = Analysis.create(originalDto)
      const dto = analysis.toDto()
      const reconstructedAnalysis = Analysis.fromDto(dto)

      // Assert
      expect(reconstructedAnalysis.communityId.toString()).toBe(originalDto.communityId)
      expect(reconstructedAnalysis.analysisType.toString()).toBe(originalDto.analysisType)
      expect(reconstructedAnalysis.analyst).toBe(originalDto.analyst)
      expect(reconstructedAnalysis.analyzedAt.getTime()).toBe(originalDto.analyzedAt.getTime())
      expect(reconstructedAnalysis.communityZoneId?.toString()).toBe(originalDto.communityZoneId)
      expect(reconstructedAnalysis.waterDepositId?.toString()).toBe(originalDto.waterDepositId)
      expect(reconstructedAnalysis.ph).toBe(originalDto.ph)
      expect(reconstructedAnalysis.chlorine).toBe(originalDto.chlorine)
      expect(reconstructedAnalysis.turbidity).toBe(originalDto.turbidity)
      expect(reconstructedAnalysis.description).toBe(originalDto.description)
    })

    it('should generate unique IDs across multiple creations', () => {
      // Arrange
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

      // Act
      const analysis1 = Analysis.create(dto1)
      const analysis2 = Analysis.create(dto2)

      // Assert
      expect(analysis1.id.toString()).not.toBe(analysis2.id.toString())
    })
  })

  describe('property access', () => {
    it('should provide read-only access to all properties', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.0,
        chlorine: 0.5,
        turbidity: 1.2
      })

      // Act & Assert
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

    it('should handle optional properties correctly', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      })

      // Act & Assert
      expect(analysis.communityZoneId).toBeUndefined()
      expect(analysis.waterDepositId).toBeUndefined()
      expect(analysis.description).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle zero values for measurements', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 0,
        chlorine: 0,
        turbidity: 0
      })

      // Act & Assert
      expect(analysis.ph).toBe(0)
      expect(analysis.chlorine).toBe(0)
      expect(analysis.turbidity).toBe(0)
    })

    it('should handle decimal values for measurements', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'complete',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.123456,
        chlorine: 0.123456,
        turbidity: 1.987654
      })

      // Act & Assert
      expect(analysis.ph).toBe(7.123456)
      expect(analysis.chlorine).toBe(0.123456)
      expect(analysis.turbidity).toBe(1.987654)
    })

    it('should handle long description text', () => {
      // Arrange
      const longDescription = 'A'.repeat(2000) // Max length according to schema
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2,
        description: longDescription
      })

      // Act & Assert
      expect(analysis.description).toBe(longDescription)
    })
  })

  describe('integration with dependencies', () => {
    it('should propagate errors from invalid Id format', () => {
      // Arrange
      const dto = {
        communityId: 'invalid-id',
        analysisType: 'chlorine_ph' as const,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow()
    })

    it('should propagate errors from invalid AnalysisType', () => {
      // Arrange
      const dto = {
        communityId: validCommunityId,
        analysisType: 'invalid_type' as never,
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      }

      // Act & Assert
      expect(() => Analysis.create(dto)).toThrow()
    })

    it('should integrate correctly with Id class', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'chlorine_ph',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        ph: 7.2
      })

      // Act & Assert
      expect(analysis.id).toBeInstanceOf(Id)
      expect(analysis.communityId).toBeInstanceOf(Id)
      expect(Id.isValidIdentifier(analysis.id.toString())).toBe(true)
      expect(Id.isValidIdentifier(analysis.communityId.toString())).toBe(true)
    })

    it('should integrate correctly with AnalysisType class', () => {
      // Arrange
      const analysis = Analysis.create({
        communityId: validCommunityId,
        analysisType: 'turbidity',
        analyst: validAnalyst,
        analyzedAt: validAnalyzedAt,
        turbidity: 2.5
      })

      // Act & Assert
      expect(analysis.analysisType).toBeInstanceOf(AnalysisType)
      expect(analysis.analysisType.equals(AnalysisType.TURBIDITY)).toBe(true)
      expect(analysis.analysisType.toString()).toBe('turbidity')
    })
  })
})
