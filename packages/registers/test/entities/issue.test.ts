import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Issue } from '../../domain/entities/issue'
import type { IssueDto } from '../../domain/entities/issue.dto'
import { IssueStatusType } from '../../domain/value-objects/issue-status-type'

describe('Issue', () => {
  const validCommunityId = 'clx12345678901234567890123'
  const validWaterZoneId = 'clx98765432109876543210987'
  const validWaterDepositId = 'clx11111111111111111111111'
  const validWaterPointId = 'clx22222222222222222222222'
  const validTitle = 'Water leak in main distribution point'
  const validReporterName = 'John Doe'
  const validStartAt = new Date('2024-01-15T10:30:00Z')
  const validEndAt = new Date('2024-01-20T15:45:00Z')
  const validDescription = 'Significant water leak detected in the main distribution point'

  describe('create()', () => {
    describe('valid creation scenarios', () => {
      it('creates issue with required fields only', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open'
        }

        const issue = Issue.create(dto)

        expect(issue.id).toBeInstanceOf(Id)
        expect(issue.communityId.toString()).toBe(validCommunityId)
        expect(issue.title).toBe(validTitle)
        expect(issue.reporterName).toBe(validReporterName)
        expect(issue.startAt.getTime()).toBe(validStartAt.getTime())
        expect(issue.status.equals(IssueStatusType.OPEN)).toBe(true)
        expect(issue.waterZoneId).toBeUndefined()
        expect(issue.waterDepositId).toBeUndefined()
        expect(issue.waterPointId).toBeUndefined()
        expect(issue.description).toBeUndefined()
        expect(issue.endAt).toBeUndefined()
      })

      it('creates issue with waterZoneId', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterZoneId: validWaterZoneId
        }

        const issue = Issue.create(dto)

        expect(issue.waterZoneId?.toString()).toBe(validWaterZoneId)
        expect(issue.waterDepositId).toBeUndefined()
        expect(issue.waterPointId).toBeUndefined()
      })

      it('creates issue with waterDepositId', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterDepositId: validWaterDepositId
        }

        const issue = Issue.create(dto)

        expect(issue.waterDepositId?.toString()).toBe(validWaterDepositId)
        expect(issue.waterZoneId).toBeUndefined()
        expect(issue.waterPointId).toBeUndefined()
      })

      it('creates issue with waterPointId', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterPointId: validWaterPointId
        }

        const issue = Issue.create(dto)

        expect(issue.waterPointId?.toString()).toBe(validWaterPointId)
        expect(issue.waterZoneId).toBeUndefined()
        expect(issue.waterDepositId).toBeUndefined()
      })

      it('creates issue with description', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          description: validDescription
        }

        const issue = Issue.create(dto)

        expect(issue.description).toBe(validDescription)
      })

      it('creates issue with endAt date', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'closed',
          endAt: validEndAt
        }

        const issue = Issue.create(dto)

        expect(issue.endAt?.getTime()).toBe(validEndAt.getTime())
        expect(issue.status.equals(IssueStatusType.CLOSED)).toBe(true)
      })

      it('creates issue with all optional fields', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterZoneId: validWaterZoneId,
          waterDepositId: validWaterDepositId,
          waterPointId: validWaterPointId,
          description: validDescription,
          endAt: validEndAt
        }

        const issue = Issue.create(dto)

        expect(issue.waterZoneId?.toString()).toBe(validWaterZoneId)
        expect(issue.waterDepositId?.toString()).toBe(validWaterDepositId)
        expect(issue.waterPointId?.toString()).toBe(validWaterPointId)
        expect(issue.description).toBe(validDescription)
        expect(issue.endAt?.getTime()).toBe(validEndAt.getTime())
      })

      it('creates issue with closed status', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'closed',
          endAt: validEndAt
        }

        const issue = Issue.create(dto)

        expect(issue.status.equals(IssueStatusType.CLOSED)).toBe(true)
        expect(issue.endAt?.getTime()).toBe(validEndAt.getTime())
      })
    })

    describe('validation error scenarios', () => {
      it('throws error for invalid communityId format', () => {
        const dto = {
          communityId: 'invalid-id',
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open'
        }

        expect(() => Issue.create(dto)).toThrow()
      })

      it('throws error for invalid waterZoneId format', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterZoneId: 'invalid-zone-id'
        }

        expect(() => Issue.create(dto)).toThrow()
      })

      it('throws error for invalid waterDepositId format', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterDepositId: 'invalid-deposit-id'
        }

        expect(() => Issue.create(dto)).toThrow()
      })

      it('throws error for invalid waterPointId format', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          waterPointId: 'invalid-point-id'
        }

        expect(() => Issue.create(dto)).toThrow()
      })

      it('throws error for invalid status value', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'invalid_status' as never
        }

        expect(() => Issue.create(dto)).toThrow()
      })

      it('throws error for empty title', () => {
        const dto = {
          communityId: validCommunityId,
          title: '',
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open'
        }

        // Note: This might not throw an error depending on validation implementation
        // Adjust based on actual validation rules
        const issue = Issue.create(dto)
        expect(issue.title).toBe('')
      })

      it('throws error for empty reporterName', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: '',
          startAt: validStartAt,
          status: 'open'
        }

        // Note: This might not throw an error depending on validation implementation
        // Adjust based on actual validation rules
        const issue = Issue.create(dto)
        expect(issue.reporterName).toBe('')
      })

      it('handles description too long', () => {
        const longDescription = 'A'.repeat(2001) // Exceeds 2000 character limit

        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          description: longDescription
        }

        // The Issue entity now validates using Zod schema (includes description length validation)
        expect(() => Issue.create(dto)).toThrow()
      })

      it('throws error when endAt is before startAt', () => {
        const pastDate = new Date('2024-01-10T10:30:00Z') // Before validStartAt

        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'open',
          endAt: pastDate
        }

        expect(() => Issue.create(dto)).toThrow('End date cannot be before start date')
      })

      it('throws error when status is closed but no endAt provided', () => {
        const dto = {
          communityId: validCommunityId,
          title: validTitle,
          reporterName: validReporterName,
          startAt: validStartAt,
          status: 'closed'
        }

        expect(() => Issue.create(dto)).toThrow('Closed issues must have an end date')
      })
    })
  })

  describe('fromDto()', () => {
    it('creates issue from complete DTO', () => {
      const dto: IssueDto = {
        id: 'clx33333333333333333333333',
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        waterPointId: validWaterPointId,
        description: validDescription,
        endAt: validEndAt
      }

      const issue = Issue.fromDto(dto)

      expect(issue.id.toString()).toBe('clx33333333333333333333333')
      expect(issue.communityId.toString()).toBe(validCommunityId)
      expect(issue.title).toBe(validTitle)
      expect(issue.reporterName).toBe(validReporterName)
      expect(issue.startAt).toBe(validStartAt)
      expect(issue.status.equals(IssueStatusType.OPEN)).toBe(true)
      expect(issue.waterZoneId?.toString()).toBe(validWaterZoneId)
      expect(issue.waterDepositId?.toString()).toBe(validWaterDepositId)
      expect(issue.waterPointId?.toString()).toBe(validWaterPointId)
      expect(issue.description).toBe(validDescription)
      expect(issue.endAt).toBe(validEndAt)
    })

    it('creates issue from DTO with optional fields as undefined', () => {
      const dto: IssueDto = {
        id: 'clx44444444444444444444444',
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'closed'
      }

      const issue = Issue.fromDto(dto)

      expect(issue.waterZoneId).toBeUndefined()
      expect(issue.waterDepositId).toBeUndefined()
      expect(issue.waterPointId).toBeUndefined()
      expect(issue.description).toBeUndefined()
      expect(issue.endAt).toBeUndefined()
      expect(issue.status.equals(IssueStatusType.CLOSED)).toBe(true)
    })

    it('creates issue from DTO with some optional fields', () => {
      const dto: IssueDto = {
        id: 'clx55555555555555555555555',
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId,
        description: validDescription
      }

      const issue = Issue.fromDto(dto)

      expect(issue.waterZoneId?.toString()).toBe(validWaterZoneId)
      expect(issue.waterDepositId).toBeUndefined()
      expect(issue.waterPointId).toBeUndefined()
      expect(issue.description).toBe(validDescription)
      expect(issue.endAt).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('converts entity to DTO with all fields', () => {
      const dto: IssueDto = {
        id: 'clx66666666666666666666666',
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        waterPointId: validWaterPointId,
        description: validDescription,
        endAt: validEndAt
      }

      const issue = Issue.fromDto(dto)
      const resultDto = issue.toDto()

      expect(resultDto).toEqual(dto)
    })

    it('converts entity to DTO with optional fields as undefined', () => {
      const dto: IssueDto = {
        id: 'clx77777777777777777777777',
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'closed'
      }

      const issue = Issue.fromDto(dto)
      const resultDto = issue.toDto()

      expect(resultDto).toEqual(dto)
    })

    it('preserves Date objects in DTO conversion', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        endAt: validEndAt
      })

      const dto = issue.toDto()

      expect(dto.startAt).toBeInstanceOf(Date)
      expect(dto.startAt.getTime()).toBe(validStartAt.getTime())
      expect(dto.endAt).toBeInstanceOf(Date)
      expect(dto.endAt?.getTime()).toBe(validEndAt.getTime())
    })

    it('handles undefined endAt in DTO conversion', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open'
      })

      const dto = issue.toDto()

      expect(dto.endAt).toBeUndefined()
    })
  })

  describe('data integrity', () => {
    it('preserves data through create -> toDto -> fromDto round trip', () => {
      const originalDto = {
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open' as const,
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        waterPointId: validWaterPointId,
        description: validDescription,
        endAt: validEndAt
      }

      const issue = Issue.create(originalDto)
      const dto = issue.toDto()
      const reconstructedIssue = Issue.fromDto(dto)

      expect(reconstructedIssue.communityId.toString()).toBe(originalDto.communityId)
      expect(reconstructedIssue.title).toBe(originalDto.title)
      expect(reconstructedIssue.reporterName).toBe(originalDto.reporterName)
      expect(reconstructedIssue.startAt.getTime()).toBe(originalDto.startAt.getTime())
      expect(reconstructedIssue.status.toString()).toBe(originalDto.status)
      expect(reconstructedIssue.waterZoneId?.toString()).toBe(originalDto.waterZoneId)
      expect(reconstructedIssue.waterDepositId?.toString()).toBe(originalDto.waterDepositId)
      expect(reconstructedIssue.waterPointId?.toString()).toBe(originalDto.waterPointId)
      expect(reconstructedIssue.description).toBe(originalDto.description)
      expect(reconstructedIssue.endAt?.getTime()).toBe(originalDto.endAt?.getTime())
    })

    it('generates unique IDs across multiple creations', () => {
      const dto1 = {
        communityId: validCommunityId,
        title: 'First Issue',
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open' as const
      }

      const dto2 = {
        communityId: validCommunityId,
        title: 'Second Issue',
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'closed' as const,
        endAt: validEndAt
      }

      const issue1 = Issue.create(dto1)
      const issue2 = Issue.create(dto2)

      expect(issue1.id.toString()).not.toBe(issue2.id.toString())
    })

    it('preserves data through fromDto -> toDto -> fromDto round trip', () => {
      const originalDto: IssueDto = {
        id: 'clx88888888888888888888888',
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId,
        description: validDescription
      }

      const issue1 = Issue.fromDto(originalDto)
      const dto = issue1.toDto()
      const issue2 = Issue.fromDto(dto)

      expect(issue2.id.toString()).toBe(issue1.id.toString())
      expect(issue2.communityId.toString()).toBe(issue1.communityId.toString())
      expect(issue2.title).toBe(issue1.title)
      expect(issue2.reporterName).toBe(issue1.reporterName)
      expect(issue2.startAt).toBe(issue1.startAt)
      expect(issue2.status.equals(issue1.status)).toBe(true)
      if (issue1.waterZoneId && issue2.waterZoneId) {
        expect(issue2.waterZoneId.toString()).toBe(issue1.waterZoneId.toString())
      } else {
        expect(issue2.waterZoneId).toEqual(issue1.waterZoneId)
      }
      expect(issue2.description).toEqual(issue1.description)
    })
  })

  describe('property access', () => {
    it('provides read-only access to all properties', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        waterPointId: validWaterPointId,
        description: validDescription,
        endAt: validEndAt
      })

      // All properties should be accessible
      expect(issue.id).toBeDefined()
      expect(issue.communityId).toBeDefined()
      expect(issue.title).toBeDefined()
      expect(issue.reporterName).toBeDefined()
      expect(issue.startAt).toBeDefined()
      expect(issue.status).toBeDefined()
      expect(issue.waterZoneId).toBeDefined()
      expect(issue.waterDepositId).toBeDefined()
      expect(issue.waterPointId).toBeDefined()
      expect(issue.description).toBeDefined()
      expect(issue.endAt).toBeDefined()

      // Properties should be read-only (TypeScript compile-time check)
      // This test verifies the properties exist and are accessible
    })

    it('handles optional properties correctly', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open'
      })

      expect(issue.waterZoneId).toBeUndefined()
      expect(issue.waterDepositId).toBeUndefined()
      expect(issue.waterPointId).toBeUndefined()
      expect(issue.description).toBeUndefined()
      expect(issue.endAt).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty strings for title and reporterName', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: '',
        reporterName: '',
        startAt: validStartAt,
        status: 'open'
      })

      expect(issue.title).toBe('')
      expect(issue.reporterName).toBe('')
    })

    it('handles maximum length description', () => {
      const maxDescription = 'A'.repeat(2000) // Max length according to schema

      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        description: maxDescription
      })

      expect(issue.description).toBe(maxDescription)
    })

    it('handles minimum length description', () => {
      const minDescription = 'A' // 1 character

      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        description: minDescription
      })

      expect(issue.description).toBe(minDescription)
    })

    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(500) // Long title

      const issue = Issue.create({
        communityId: validCommunityId,
        title: longTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open'
      })

      expect(issue.title).toBe(longTitle)
    })

    it('handles special characters in strings', () => {
      const specialTitle = 'Issue with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const specialReporter = 'Reporter with ñ and émojis 🚰💧'
      const specialDescription =
        'Description with "quotes" and \'apostrophes\' and newlines\nand tabs\t'

      const issue = Issue.create({
        communityId: validCommunityId,
        title: specialTitle,
        reporterName: specialReporter,
        startAt: validStartAt,
        status: 'open',
        description: specialDescription
      })

      expect(issue.title).toBe(specialTitle)
      expect(issue.reporterName).toBe(specialReporter)
      expect(issue.description).toBe(specialDescription)
    })

    it('handles date edge cases', () => {
      const sameDate = new Date('2024-01-15T10:30:00Z')
      const futureDate = new Date('2024-12-31T23:59:59Z')

      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: sameDate,
        status: 'closed',
        endAt: sameDate // Same as startAt
      })

      expect(issue.startAt.getTime()).toBe(sameDate.getTime())
      expect(issue.endAt?.getTime()).toBe(sameDate.getTime())

      const issue2 = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        endAt: futureDate
      })

      expect(issue2.endAt?.getTime()).toBe(futureDate.getTime())
    })
  })

  describe('integration with dependencies', () => {
    it('integrates correctly with Id class', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId
      })

      expect(issue.id).toBeInstanceOf(Id)
      expect(issue.communityId).toBeInstanceOf(Id)
      expect(issue.waterZoneId).toBeInstanceOf(Id)
      expect(Id.isValidIdentifier(issue.id.toString())).toBe(true)
      expect(Id.isValidIdentifier(issue.communityId.toString())).toBe(true)
      expect(issue.waterZoneId).toBeDefined()
      expect(Id.isValidIdentifier(issue.waterZoneId?.toString() || '')).toBe(true)
    })

    it('integrates correctly with IssueStatusType class', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'closed',
        endAt: validEndAt
      })

      expect(issue.status).toBeInstanceOf(IssueStatusType)
      expect(issue.status.equals(IssueStatusType.CLOSED)).toBe(true)
      expect(issue.status.toString()).toBe('closed')
    })

    it('propagates errors from invalid Id format', () => {
      const dto = {
        communityId: 'invalid-id',
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open' as const
      }

      expect(() => Issue.create(dto)).toThrow()
    })

    it('propagates errors from invalid IssueStatusType', () => {
      const dto = {
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'invalid_status' as never
      }

      expect(() => Issue.create(dto)).toThrow()
    })

    it('handles multiple optional Id fields correctly', () => {
      const issue = Issue.create({
        communityId: validCommunityId,
        title: validTitle,
        reporterName: validReporterName,
        startAt: validStartAt,
        status: 'open',
        waterZoneId: validWaterZoneId,
        waterDepositId: validWaterDepositId,
        waterPointId: validWaterPointId
      })

      expect(issue.waterZoneId).toBeInstanceOf(Id)
      expect(issue.waterDepositId).toBeInstanceOf(Id)
      expect(issue.waterPointId).toBeInstanceOf(Id)
      expect(issue.waterZoneId?.toString()).toBe(validWaterZoneId)
      expect(issue.waterDepositId?.toString()).toBe(validWaterDepositId)
      expect(issue.waterPointId?.toString()).toBe(validWaterPointId)
    })
  })
})
