import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Incident } from '../../domain/entities/incident'
import {
  IncidentClosedWithoutEndDateError,
  IncidentEndDateBeforeStartDateError
} from '../../domain/errors/incident-errors'
import { IncidentStatusType } from '../../domain/value-objects/incident-status-type'

describe('Incident Entity', () => {
  const validIncidentData = {
    title: 'Water leak in main pipe',
    reporterName: 'John Doe',
    startAt: new Date('2024-01-15T10:00:00Z'),
    communityId: Id.generateUniqueId().toString(),
    communityZoneId: Id.generateUniqueId().toString(),
    description: 'There is a significant water leak in the main pipe near the community center.',
    status: 'open' as const
  }

  describe('create', () => {
    it('should create a valid incident with all required fields', () => {
      const incident = Incident.create(validIncidentData)

      expect(incident.title).toBe(validIncidentData.title)
      expect(incident.reporterName).toBe(validIncidentData.reporterName)
      expect(incident.startAt).toEqual(validIncidentData.startAt)
      expect(incident.communityId.toString()).toBe(validIncidentData.communityId)
      expect(incident.communityZoneId?.toString()).toBe(validIncidentData.communityZoneId)
      expect(incident.description).toBe(validIncidentData.description)
      expect(incident.status.toString()).toBe('open')
      expect(incident.id).toBeDefined()
    })

    it('should create an incident with minimal required fields', () => {
      const minimalData = {
        title: 'Test Incident',
        reporterName: 'Jane Doe',
        startAt: new Date(),
        communityId: Id.generateUniqueId().toString(),
        status: 'open' as const
      }

      const incident = Incident.create(minimalData)

      expect(incident.title).toBe(minimalData.title)
      expect(incident.reporterName).toBe(minimalData.reporterName)
      expect(incident.communityId.toString()).toBe(minimalData.communityId)
      expect(incident.communityZoneId).toBeUndefined()
      expect(incident.waterDepositId).toBeUndefined()
      expect(incident.waterPointId).toBeUndefined()
      expect(incident.description).toBeUndefined()
    })

    it('should throw error when end date is before start date', () => {
      const invalidData = {
        ...validIncidentData,
        startAt: new Date('2024-01-15T10:00:00Z'),
        endAt: new Date('2024-01-14T10:00:00Z')
      }

      expect(() => Incident.create(invalidData)).toThrow(IncidentEndDateBeforeStartDateError)
    })

    it('should throw error when closed incident has no end date', () => {
      const invalidData = {
        ...validIncidentData,
        status: 'closed' as const,
        endAt: undefined
      }

      expect(() => Incident.create(invalidData)).toThrow(IncidentClosedWithoutEndDateError)
    })
  })

  describe('fromDto', () => {
    it('should create incident from DTO', () => {
      const dto = {
        id: Id.generateUniqueId().toString(),
        title: 'Test Incident',
        reporterName: 'John Doe',
        startAt: new Date('2024-01-15T10:00:00Z'),
        communityId: Id.generateUniqueId().toString(),
        communityZoneId: Id.generateUniqueId().toString(),
        description: 'Test description',
        status: 'open' as const,
        endAt: undefined
      }

      const incident = Incident.fromDto(dto)

      expect(incident.id.toString()).toBe(dto.id)
      expect(incident.title).toBe(dto.title)
      expect(incident.reporterName).toBe(dto.reporterName)
      expect(incident.startAt).toEqual(dto.startAt)
      expect(incident.communityId.toString()).toBe(dto.communityId)
      expect(incident.communityZoneId?.toString()).toBe(dto.communityZoneId)
      expect(incident.description).toBe(dto.description)
      expect(incident.status.toString()).toBe(dto.status)
    })
  })

  describe('toDto', () => {
    it('should convert incident to DTO', () => {
      const incident = Incident.create(validIncidentData)
      const dto = incident.toDto()

      expect(dto.id).toBe(incident.id.toString())
      expect(dto.title).toBe(incident.title)
      expect(dto.reporterName).toBe(incident.reporterName)
      expect(dto.startAt).toEqual(incident.startAt)
      expect(dto.communityId).toBe(incident.communityId.toString())
      expect(dto.communityZoneId).toBe(incident.communityZoneId?.toString())
      expect(dto.description).toBe(incident.description)
      expect(dto.status).toBe(incident.status.toString())
    })
  })
})
