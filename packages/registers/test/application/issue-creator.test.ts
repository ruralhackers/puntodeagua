import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { IssueCreator } from '../../application/issue-creator.service'
import { Issue } from '../../domain/entities/issue'
import type { IssueRepository } from '../../domain/repositories/issue.repository'

describe('IssueCreator Service', () => {
  let mockRepository: IssueRepository
  let issueCreator: IssueCreator

  beforeEach(() => {
    mockRepository = {
      save: mock(),
      findAll: mock(),
      findById: mock(),
      findByCommunityId: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as IssueRepository

    issueCreator = new IssueCreator(mockRepository)
  })

  describe('run', () => {
    it('should save an issue', async () => {
      const issue = Issue.create({
        title: 'Water leak in main pipe',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'There is a significant water leak in the main pipe.',
        status: 'open'
      })

      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await issueCreator.run({ issue })

      expect(mockRepository.save).toHaveBeenCalledWith(issue)
      expect(result).toBe(issue)
      expect(result.title).toBe('Water leak in main pipe')
      expect(result.reporterName).toBe('John Doe')
      expect(result.status.toString()).toBe('open')
      expect(result.id).toBeDefined()
    })

    it('should save an issue with minimal required fields', async () => {
      const issue = Issue.create({
        title: 'Test Issue',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })

      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await issueCreator.run({ issue })

      expect(mockRepository.save).toHaveBeenCalledWith(issue)
      expect(result).toBe(issue)
      expect(result.title).toBe('Test Issue')
      expect(result.reporterName).toBe('Jane Doe')
      expect(result.waterZoneId).toBeUndefined()
      expect(result.waterDepositId).toBeUndefined()
      expect(result.waterPointId).toBeUndefined()
      expect(result.description).toBeUndefined()
    })

    it('should handle repository errors', async () => {
      const issue = Issue.create({
        title: 'Test Issue',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })

      const error = new Error('Database connection failed')
      mockRepository.save = mock().mockRejectedValue(error)

      await expect(issueCreator.run({ issue })).rejects.toThrow('Database connection failed')
    })
  })
})
