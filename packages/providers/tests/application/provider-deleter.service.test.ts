import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { ProviderDeleter } from '../../application/provider-deleter.service'
import { Provider } from '../../domain/entities/provider'
import { ProviderNotFoundError } from '../../domain/errors/provider-errors'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'
import { createMockProviderRepository } from '../helpers/mocks'

describe('ProviderDeleter', () => {
  let service: ProviderDeleter
  let mockProviderRepository: ProviderRepository

  beforeEach(() => {
    mockProviderRepository = createMockProviderRepository()
    service = new ProviderDeleter(mockProviderRepository)
  })

  it('should throw ProviderNotFoundError when provider does not exist', async () => {
    // Arrange
    const providerId = Id.generateUniqueId()

    mockProviderRepository.findById = mock().mockResolvedValue(undefined)

    // Act & Assert
    await expect(service.run({ id: providerId })).rejects.toThrow(ProviderNotFoundError)

    expect(mockProviderRepository.findById).toHaveBeenCalledWith(providerId)
    expect(mockProviderRepository.delete).not.toHaveBeenCalled()
  })

  it('should delete provider successfully', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Test Company',
      contactPerson: 'John Doe',
      contactPhone: '+1234567890',
      providerType: 'plumbing',
      isActive: true,
      emergencyAvailable: false
    })

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.delete = mock().mockResolvedValue(undefined)

    // Act
    await service.run({ id: provider.id })

    // Assert
    expect(mockProviderRepository.findById).toHaveBeenCalledWith(provider.id)
    expect(mockProviderRepository.delete).toHaveBeenCalledWith(provider.id)
  })

  it('should call repository methods in correct order', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Order Test Company',
      contactPerson: 'Test Person',
      contactPhone: '+1234567890',
      providerType: 'electricity',
      isActive: true,
      emergencyAvailable: false
    })

    const callOrder: string[] = []

    mockProviderRepository.findById = mock().mockImplementation(async () => {
      callOrder.push('findById')
      return provider
    })

    mockProviderRepository.delete = mock().mockImplementation(async () => {
      callOrder.push('delete')
    })

    // Act
    await service.run({ id: provider.id })

    // Assert
    expect(callOrder).toEqual(['findById', 'delete'])
  })

  it('should not call delete if provider not found', async () => {
    // Arrange
    const providerId = Id.generateUniqueId()

    mockProviderRepository.findById = mock().mockResolvedValue(undefined)
    mockProviderRepository.delete = mock()

    // Act & Assert
    try {
      await service.run({ id: providerId })
    } catch (error) {
      // Expected error
    }

    expect(mockProviderRepository.findById).toHaveBeenCalledTimes(1)
    expect(mockProviderRepository.delete).not.toHaveBeenCalled()
  })

  it('should handle deletion of active provider', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Active Provider',
      contactPerson: 'Active Person',
      contactPhone: '+1234567890',
      providerType: 'masonry',
      isActive: true,
      emergencyAvailable: true
    })

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.delete = mock().mockResolvedValue(undefined)

    // Act
    await service.run({ id: provider.id })

    // Assert
    expect(mockProviderRepository.delete).toHaveBeenCalledWith(provider.id)
    expect(mockProviderRepository.delete).toHaveBeenCalledTimes(1)
  })

  it('should handle deletion of inactive provider', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Inactive Provider',
      contactPerson: 'Inactive Person',
      contactPhone: '+1234567890',
      providerType: 'analysis',
      isActive: false,
      emergencyAvailable: false
    })

    mockProviderRepository.findById = mock().mockResolvedValue(provider)
    mockProviderRepository.delete = mock().mockResolvedValue(undefined)

    // Act
    await service.run({ id: provider.id })

    // Assert
    expect(mockProviderRepository.delete).toHaveBeenCalledWith(provider.id)
    expect(mockProviderRepository.delete).toHaveBeenCalledTimes(1)
  })
})

