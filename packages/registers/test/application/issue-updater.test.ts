import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { IncidentUpdater } from '../../application/incident-updater.service'
import { Incident } from '../../domain/entities/incident'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'

describe('IncidentUpdater Service', () => {
  let mockRepository: IncidentRepository
  let incidentUpdater: IncidentUpdater

  beforeEach(() => {
    mockRepository = {
      save: mock(),
      findAll: mock(),
      findById: mock(),
      findByCommunityId: mock(),
      delete: mock(),
      findForTable: mock()
    } as unknown as IncidentRepository

    incidentUpdater = new IncidentUpdater(mockRepository)
  })

  describe('run', () => {
    it('should update an existing incident', async () => {
      const incidentId = Id.generateUniqueId()
      const existingIncident = Incident.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'Original description',
        status: 'open'
      })

      const updatedIncident = Incident.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        description: 'Updated description',
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(existingIncident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await incidentUpdater.run({ id: incidentId, updatedIncident })

      expect(mockRepository.findById).toHaveBeenCalledWith(incidentId)
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Incident))
      expect(result.title).toBe('Updated Title')
      expect(result.reporterName).toBe('Jane Doe')
      expect(result.status.toString()).toBe('closed')
      expect(result.communityId.toString()).toBe(existingIncident.communityId.toString()) // Should keep original community
    })

    it('should merge updated fields with existing fields', async () => {
      const incidentId = Id.generateUniqueId()
      const existingIncident = Incident.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        waterZoneId: Id.generateUniqueId().toString(),
        waterDepositId: Id.generateUniqueId().toString(),
        description: 'Original description',
        status: 'open'
      })

      const updatedIncident = Incident.create({
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

      mockRepository.findById = mock().mockResolvedValue(existingIncident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      const result = await incidentUpdater.run({ id: incidentId, updatedIncident })

      expect(result.title).toBe('Updated Title')
      expect(result.reporterName).toBe('Jane Doe')
      expect(result.status.toString()).toBe('closed')
      expect(result.waterZoneId?.toString()).toBe(existingIncident.waterZoneId?.toString()) // Should keep existing
      expect(result.waterDepositId?.toString()).toBe(existingIncident.waterDepositId?.toString()) // Should keep existing
      expect(result.description).toBe(existingIncident.description) // Should keep existing
      expect(result.communityId.toString()).toBe(existingIncident.communityId.toString()) // Should keep existing
    })

    it('should throw error when incident is not found', async () => {
      const incidentId = Id.generateUniqueId()
      const updatedIncident = Incident.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(undefined)

      await expect(incidentUpdater.run({ id: incidentId, updatedIncident })).rejects.toThrow(
        `Incident with id ${incidentId.toString()} not found`
      )

      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should handle repository errors during save', async () => {
      const incidentId = Id.generateUniqueId()
      const existingIncident = Incident.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })

      const updatedIncident = Incident.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      mockRepository.findById = mock().mockResolvedValue(existingIncident)
      const error = new Error('Database connection failed')
      mockRepository.save = mock().mockRejectedValue(error)

      await expect(incidentUpdater.run({ id: incidentId, updatedIncident })).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle repository errors during find', async () => {
      const incidentId = Id.generateUniqueId()
      const updatedIncident = Incident.create({
        title: 'Updated Title',
        reporterName: 'Jane Doe',
        startAt: new Date('2024-01-16T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      })

      const error = new Error('Database connection failed')
      mockRepository.findById = mock().mockRejectedValue(error)

      await expect(incidentUpdater.run({ id: incidentId, updatedIncident })).rejects.toThrow(
        'Database connection failed'
      )

      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })
})
