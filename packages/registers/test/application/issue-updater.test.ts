import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { IssueUpdater } from '../../application/issue-updater.service'
import { Issue } from '../../domain/entities/issue'
import type { IssueRepository } from '../../domain/repositories/issue.repository'

describe('IssueUpdater Service', () => {
  let mockRepository: IssueRepository
  let issueUpdater: IssueUpdater

  beforeEach(() => {
    mockRepository = {
      save: mock(),
      findAll: mock(),
      findById: mock(),
      findByCommunityId: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as IssueRepository

    issueUpdater = new IssueUpdater(mockRepository)
  })

  describe('run', () => {
    it('should update an existing issue', async () => {
      const issueId = Id.generateUniqueId()
      const existingIssue = Issue.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'Original description',
        status: 'open'
      })

      const updatedIssue = Issue.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'Updated description',
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(existingIssue)
      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await issueUpdater.run({ id: issueId, updatedIssue })

      expect(mockRepository.findById).toHaveBeenCalledWith(issueId)
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Issue))
      expect(result.title).toBe('Updated Title')
      expect(result.reporterName).toBe('Jane Doe')
      expect(result.status.toString()).toBe('closed')
      expect(result.communityId.toString()).toBe(existingIssue.communityId.toString()) // Should keep original community
    })

    it('should merge updated fields with existing fields', async () => {
      const issueId = Id.generateUniqueId()
      const existingIssue = Issue.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        waterDepositId: Id.generateUniqueId().toString(),
        description: 'Original description',
        status: 'open'
      })

      const updatedIssue = Issue.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: undefined, // This should fall back to existing
        waterDepositId: undefined, // This should fall back to existing
        description: undefined, // This should fall back to existing
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(existingIssue)
      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await issueUpdater.run({ id: issueId, updatedIssue })

      expect(result.title).toBe('Updated Title')
      expect(result.reporterName).toBe('Jane Doe')
      expect(result.status.toString()).toBe('closed')
      expect(result.waterZoneId?.toString()).toBe(existingIssue.waterZoneId?.toString()) // Should keep existing
      expect(result.waterDepositId?.toString()).toBe(existingIssue.waterDepositId?.toString()) // Should keep existing
      expect(result.description).toBe(existingIssue.description) // Should keep existing
      expect(result.communityId.toString()).toBe(existingIssue.communityId.toString()) // Should keep existing
    })

    it('should throw error when issue is not found', async () => {
      const issueId = Id.generateUniqueId()
      const updatedIssue = Issue.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(undefined)

      await expect(issueUpdater.run({ id: issueId, updatedIssue })).rejects.toThrow(
        `Issue with id ${issueId.toString()} not found`
      )

      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should handle repository errors during save', async () => {
      const issueId = Id.generateUniqueId()
      const existingIssue = Issue.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })

      const updatedIssue = Issue.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(existingIssue)
      const error = new Error('Database connection failed')
      mockRepository.save = mock().mockRejectedValue(error)

      await expect(issueUpdater.run({ id: issueId, updatedIssue })).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle repository errors during find', async () => {
      const issueId = Id.generateUniqueId()
      const updatedIssue = Issue.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      const error = new Error('Database connection failed')
      mockRepository.findById = mock().mockRejectedValue(error)

      await expect(issueUpdater.run({ id: issueId, updatedIssue })).rejects.toThrow(
        'Database connection failed'
      )

      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })
})
