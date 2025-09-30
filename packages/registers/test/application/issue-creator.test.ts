import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { IncidentCreator } from '../../application/incident-creator.service'
import { Incident } from '../../domain/entities/incident'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'

describe('IncidentCreator Service', () => {
  let mockRepository: IncidentRepository
  let incidentCreator: IncidentCreator

  beforeEach(() => {
    mockRepository = {
      save: mock(),
      findAll: mock(),
      findById: mock(),
      findByCommunityId: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as IncidentRepository

    incidentCreator = new IncidentCreator(mockRepository)
  })

  describe('run', () => {
    it('should save an incident', async () => {
      const incident = Incident.create({
        title: 'Water leak in main pipe',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'There is a significant water leak in the main pipe.',
        status: 'open'
      })

      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await incidentCreator.run({ incident })

      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result).toBe(incident)
      expect(result.title).toBe('Water leak in main pipe')
      expect(result.reporterName).toBe('John Doe')
      expect(result.status.toString()).toBe('open')
      expect(result.id).toBeDefined()
    })

    it('should save an incident with minimal required fields', async () => {
      const incident = Incident.create({
        title: 'Test Incident',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })

      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await incidentCreator.run({ incident })

      expect(mockRepository.save).toHaveBeenCalledWith(incident)
      expect(result).toBe(incident)
      expect(result.title).toBe('Test Incident')
      expect(result.reporterName).toBe('Jane Doe')
      expect(result.waterZoneId).toBeUndefined()
      expect(result.waterDepositId).toBeUndefined()
      expect(result.waterPointId).toBeUndefined()
      expect(result.description).toBeUndefined()
    })

    it('should handle repository errors', async () => {
      const incident = Incident.create({
        title: 'Test Incident',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })

      const error = new Error('Database connection failed')
      mockRepository.save = mock().mockRejectedValue(error)

      await expect(incidentCreator.run({ incident })).rejects.toThrow('Database connection failed')
    })
  })
})
