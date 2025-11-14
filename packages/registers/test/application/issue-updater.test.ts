import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { IncidentUpdater } from '../../application/incident-updater.service'
import { Incident } from '../../domain/entities/incident'
import type { IncidentUpdateDto } from '../../domain/entities/incident.dto'
import { IncidentNotFoundError } from '../../domain/errors/incident-errors'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'
import { createMockIncidentRepository } from '../helpers/mocks'

describe('IncidentUpdater Service', () => {
  let mockRepository: IncidentRepository
  let incidentUpdater: IncidentUpdater

  beforeEach(() => {
    mockRepository = createMockIncidentRepository()
    incidentUpdater = new IncidentUpdater(mockRepository)
  })

  describe('run', () => {
    it('should throw error when incident is not found', async () => {
      // Arrange
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

      // Act & Assert
      await expect(incidentUpdater.run({ id: incidentId, updatedIncident })).rejects.toThrow(
        IncidentNotFoundError
      )
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should handle repository errors during find', async () => {
      // Arrange
      const incidentId = Id.generateUniqueId()
      const updatedIncidentData = {
        status: 'closed' as const,
        endAt: new Date('2024-01-16T12:00:00Z'),
        closingDescription: undefined
      }
      const error = new Error('Database connection failed')
      mockRepository.findById = mock().mockRejectedValue(error)

      // Act & Assert
      await expect(incidentUpdater.run({ id: incidentId, updatedIncidentData })).rejects.toThrow(
        'Database connection failed'
      )
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should handle repository errors during save', async () => {
      // Arrange
      const incidentId = Id.generateUniqueId()
      const existingIncident = Incident.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        status: 'open'
      })
      const updatedIncident: IncidentUpdateDto = {
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z'),
        closingDescription: undefined
      }
      mockRepository.findById = mock().mockResolvedValue(existingIncident)
      const error = new Error('Database connection failed')
      mockRepository.save = mock().mockRejectedValue(error)

      // Act & Assert
      await expect(
        incidentUpdater.run({ id: incidentId, updatedIncidentData: updatedIncident })
      ).rejects.toThrow('Database connection failed')
    })

    it('should update an existing incident', async () => {
      // Arrange
      const incidentId = Id.generateUniqueId()
      const existingIncident = Incident.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        communityZoneId: Id.generateUniqueId().toString(),
        description: 'Original description',
        status: 'open'
      })
      const updatedIncident: IncidentUpdateDto = {
        closingDescription: 'Updated description',
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      }
      mockRepository.findById = mock().mockResolvedValue(existingIncident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      // Act
      const result = await incidentUpdater.run({
        id: incidentId,
        updatedIncidentData: updatedIncident
      })

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(incidentId)
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Incident))
      expect(result.incident.closingDescription).toBe('Updated description')
      expect(result.incident.status.toString()).toBe('closed')
      expect(result.imageUploadErrors).toBeUndefined()
      expect(result.imageDeleteErrors).toBeUndefined()
    })

    it('should merge updated fields with existing fields', async () => {
      // Arrange
      const incidentId = Id.generateUniqueId()
      const existingIncident = Incident.create({
        title: 'Original Title',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        communityZoneId: Id.generateUniqueId().toString(),
        waterDepositId: Id.generateUniqueId().toString(),
        description: 'Original description',
        status: 'open'
      })
      const updatedIncident: IncidentUpdateDto = {
        closingDescription: undefined, // This should fall back to existing
        status: 'closed',
        endAt: new Date('2024-01-16T12:00:00Z')
      }
      mockRepository.findById = mock().mockResolvedValue(existingIncident)
      mockRepository.save = mock().mockResolvedValue(undefined)

      // Act
      const result = await incidentUpdater.run({
        id: incidentId,
        updatedIncidentData: updatedIncident
      })

      // Assert
      expect(result.incident.status.toString()).toBe('closed')
      expect(result.incident.closingDescription).toBeUndefined()
      expect(result.imageUploadErrors).toBeUndefined()
      expect(result.imageDeleteErrors).toBeUndefined()
    })
  })
})
