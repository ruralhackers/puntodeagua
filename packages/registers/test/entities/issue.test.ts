import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Issue } from '../../domain/entities/issue'
import { IssueStatusType } from '../../domain/value-objects/issue-status-type'

describe('Issue Entity', () => {
  const validIssueData = {
    title: 'Water leak in main pipe',
    reporterName: 'John Doe',
    startAt: new Date('2024-01-15T10:00:00Z'),
    communityId: Id.generateUniqueId().toString(),
    waterZoneId: Id.generateUniqueId().toString(),
    description: 'There is a significant water leak in the main pipe near the community center.',
    status: 'open' as const
  }

  describe('create', () => {
    it('should create a valid issue with all required fields', () => {
      const issue = Issue.create(validIssueData)

      expect(issue.title).toBe(validIssueData.title)
      expect(issue.reporterName).toBe(validIssueData.reporterName)
      expect(issue.startAt).toEqual(validIssueData.startAt)
      expect(issue.communityId.toString()).toBe(validIssueData.communityId)
      expect(issue.waterZoneId?.toString()).toBe(validIssueData.waterZoneId)
      expect(issue.description).toBe(validIssueData.description)
      expect(issue.status.toString()).toBe('open')
      expect(issue.id).toBeDefined()
    })

    it('should create an issue with minimal required fields', () => {
      const minimalData = {
        title: 'Test Issue',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open' as const
      }

      const issue = Issue.create(minimalData)

      expect(issue.title).toBe(minimalData.title)
      expect(issue.reporterName).toBe(minimalData.reporterName)
      expect(issue.communityId.toString()).toBe(minimalData.communityId)
      expect(issue.waterZoneId).toBeUndefined()
      expect(issue.waterDepositId).toBeUndefined()
      expect(issue.waterPointId).toBeUndefined()
      expect(issue.description).toBeUndefined()
    })

    it('should throw error when end date is before start date', () => {
      const invalidData = {
        ...validIssueData,
        startAt: new Date('2024-01-15T10:00:00Z'),
        endAt: new Date('2024-01-14T10:00:00Z')
      }

      expect(() => Issue.create(invalidData)).toThrow('End date cannot be before start date')
    })

    it('should throw error when closed issue has no end date', () => {
      const invalidData = {
        ...validIssueData,
        status: 'closed' as const,
        endAt: undefined
      }

      expect(() => Issue.create(invalidData)).toThrow('Closed issues must have an end date')
    })
  })

  describe('fromDto', () => {
    it('should create issue from DTO', () => {
      const dto = {
        id: Id.generateUniqueId().toString(),
        title: 'Test Issue',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'Test description',
        status: 'open' as const,
        endAt: undefined
      }

      const issue = Issue.fromDto(dto)

      expect(issue.id.toString()).toBe(dto.id)
      expect(issue.title).toBe(dto.title)
      expect(issue.reporterName).toBe(dto.reporterName)
      expect(issue.startAt).toEqual(dto.startAt)
      expect(issue.communityId.toString()).toBe(dto.communityId)
      expect(issue.waterZoneId?.toString()).toBe(dto.waterZoneId)
      expect(issue.description).toBe(dto.description)
      expect(issue.status.toString()).toBe(dto.status)
    })
  })

  describe('toDto', () => {
    it('should convert issue to DTO', () => {
      const issue = Issue.create(validIssueData)
      const dto = issue.toDto()

      expect(dto.id).toBe(issue.id.toString())
      expect(dto.title).toBe(issue.title)
      expect(dto.reporterName).toBe(issue.reporterName)
      expect(dto.startAt).toEqual(issue.startAt)
      expect(dto.communityId).toBe(issue.communityId.toString())
      expect(dto.waterZoneId).toBe(issue.waterZoneId?.toString())
      expect(dto.description).toBe(issue.description)
      expect(dto.status).toBe(issue.status.toString())
    })
  })
})
