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
    it('should create and save an issue', async () => {
      const params = {
        title: 'Water leak in main pipe',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId(),
        waterZoneId: Id.generateUniqueId(),
        description: 'There is a significant water leak in the main pipe.'
      }

      const savedIssue = Issue.create({
        title: params.title,
        reporterName: params.reporterName,
        startAt: params.startAt,
        communityId: params.communityId.toString(),
        waterZoneId: params.waterZoneId.toString(),
        description: params.description,
        status: 'open'
      })

      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await issueCreator.run(params)

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Issue))
      expect(result.title).toBe(params.title)
      expect(result.reporterName).toBe(params.reporterName)
      expect(result.status.toString()).toBe('open')
      expect(result.id).toBeDefined()
    })

    it('should create an issue with minimal required fields', async () => {
      const params = {
        title: 'Test Issue',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId()
      }

      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await issueCreator.run(params)

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Issue))
      expect(result.title).toBe(params.title)
      expect(result.reporterName).toBe(params.reporterName)
      expect(result.waterZoneId).toBeUndefined()
      expect(result.waterDepositId).toBeUndefined()
      expect(result.waterPointId).toBeUndefined()
      expect(result.description).toBeUndefined()
    })

    it('should handle repository errors', async () => {
      const params = {
        title: 'Test Issue',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId()
      }

      const error = new Error('Database connection failed')
      mockRepository.save = mock().mockRejectedValue(error)

      await expect(issueCreator.run(params)).rejects.toThrow('Database connection failed')
    })
  })
})
