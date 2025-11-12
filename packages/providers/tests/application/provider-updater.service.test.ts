import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { ProviderUpdater } from '../../application/provider-updater.service'
import { Provider } from '../../domain/entities/provider'
import { ProviderNotFoundError } from '../../domain/errors/provider-errors'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'
import { createMockProviderRepository } from '../helpers/mocks'

describe('ProviderUpdater', () => {
  let service: ProviderUpdater
  let mockProviderRepository: ProviderRepository

  beforeEach(() => {
    mockProviderRepository = createMockProviderRepository()
    service = new ProviderUpdater(mockProviderRepository)
  })

  it('should throw ProviderNotFoundError when provider does not exist', async () => {
    // Arrange
    const providerId = Id.generateUniqueId()
    const updateData = {
      companyName: 'Updated Company',
      contactPerson: 'John Doe',
      contactPhone: '+1234567890',
      providerType: 'plumbing' as const,
      isActive: true,
      emergencyAvailable: false
    }

    mockProviderRepository.findById = mock().mockResolvedValue(undefined)

    // Act & Assert
    await expect(
      service.run({ id: providerId, updatedProviderData: updateData })
    ).rejects.toThrow(ProviderNotFoundError)

    expect(mockProviderRepository.findById).toHaveBeenCalledWith(providerId)
    expect(mockProviderRepository.save).not.toHaveBeenCalled()
  })

  it('should update provider successfully', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Original Company',
      contactPerson: 'John Doe',
      contactPhone: '+1234567890',
      providerType: 'plumbing',
      isActive: true,
      emergencyAvailable: false
    })

    const updateData = {
      companyName: 'Original Company',
      contactPerson: 'John Doe',
      contactPhone: '+1234567890',
      providerType: 'electricity' as const,
      isActive: false,
      notes: 'Updated notes',
      emergencyAvailable: false
    }

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.run({ id: provider.id, updatedProviderData: updateData })

    // Assert
    expect(result).toBeInstanceOf(Provider)
    expect(result.providerType.toString()).toBe('electricity')
    expect(result.isActive).toBe(false)
    expect(result.notes).toBe('Updated notes')
    expect(mockProviderRepository.findById).toHaveBeenCalledWith(provider.id)
    expect(mockProviderRepository.save).toHaveBeenCalledWith(provider)
  })

  it('should update provider to "other" with customProviderType', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Test Company',
      contactPerson: 'Jane Smith',
      contactPhone: '+1234567890',
      providerType: 'plumbing',
      isActive: true,
      emergencyAvailable: false
    })

    const updateData = {
      companyName: 'Test Company',
      contactPerson: 'Jane Smith',
      contactPhone: '+1234567890',
      providerType: 'other' as const,
      customProviderType: 'Painting',
      isActive: true,
      emergencyAvailable: false
    }

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.run({ id: provider.id, updatedProviderData: updateData })

    // Assert
    expect(result.providerType.toString()).toBe('other')
    expect(result.customProviderType).toBe('Painting')
    expect(mockProviderRepository.save).toHaveBeenCalled()
  })

  it('should maintain provider id after update', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'ID Test Company',
      contactPerson: 'Test Person',
      contactPhone: '+1234567890',
      providerType: 'masonry',
      isActive: true,
      emergencyAvailable: false
    })

    const originalId = provider.id.toString()

    const updateData = {
      companyName: 'ID Test Company',
      contactPerson: 'Test Person',
      contactPhone: '+1234567890',
      providerType: 'analysis' as const,
      isActive: false,
      emergencyAvailable: false
    }

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.run({ id: provider.id, updatedProviderData: updateData })

    // Assert
    expect(result.id.toString()).toBe(originalId)
  })

  it('should call repository methods in correct order', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Order Test',
      contactPerson: 'Test Person',
      contactPhone: '+1234567890',
      providerType: 'electricity',
      isActive: true,
      emergencyAvailable: false
    })

    const updateData = {
      companyName: 'Order Test',
      contactPerson: 'Test Person',
      contactPhone: '+1234567890',
      providerType: 'plumbing' as const,
      isActive: true,
      emergencyAvailable: false
    }

    const callOrder: string[] = []

    mockProviderRepository.findById = mock().mockImplementation(async () => {
      callOrder.push('findById')
      return provider
    })

    mockProviderRepository.save = mock().mockImplementation(async () => {
      callOrder.push('save')
    })

    // Act
    await service.run({ id: provider.id, updatedProviderData: updateData })

    // Assert
    expect(callOrder).toEqual(['findById', 'save'])
  })

  it('should update only mutable fields', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Immutable Test',
      contactPerson: 'Original Person',
      contactPhone: '+1234567890',
      providerType: 'analysis',
      isActive: true,
      notes: 'Original notes',
      emergencyAvailable: false
    })

    const originalCompanyName = provider.companyName
    const originalContactPerson = provider.contactPerson

    const updateData = {
      companyName: 'Immutable Test',
      contactPerson: 'Original Person',
      contactPhone: '+1234567890',
      providerType: 'electricity' as const,
      isActive: false,
      notes: 'New notes',
      emergencyAvailable: true
    }

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.run({ id: provider.id, updatedProviderData: updateData })

    // Assert
    expect(result.companyName).toBe(originalCompanyName)
    expect(result.contactPerson).toBe(originalContactPerson)
    expect(result.providerType.toString()).toBe('electricity')
    expect(result.isActive).toBe(false)
    expect(result.notes).toBe('New notes')
  })
})

