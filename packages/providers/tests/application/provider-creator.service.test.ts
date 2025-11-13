import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { ProviderCreator } from '../../application/provider-creator.service'
import { Provider } from '../../domain/entities/provider'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'
import { createMockProviderRepository } from '../helpers/mocks'

describe('ProviderCreator', () => {
  let service: ProviderCreator
  let mockProviderRepository: ProviderRepository

  beforeEach(() => {
    mockProviderRepository = createMockProviderRepository()
    service = new ProviderCreator(mockProviderRepository)
  })

  it('should create a provider successfully', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Test Company',
      contactPerson: 'John Doe',
      contactPhone: '+1234567890',
      providerType: 'plumbing',
      isActive: true,
      emergencyAvailable: false
    })

    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.run({ provider })

    // Assert
    expect(result).toBeInstanceOf(Provider)
    expect(result.companyName).toBe('Test Company')
    expect(result.contactPerson).toBe('John Doe')
    expect(mockProviderRepository.save).toHaveBeenCalledWith(provider)
  })

  it('should create provider with all optional fields', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Full Details Company',
      taxId: 'ABC123456',
      contactPerson: 'Jane Smith',
      contactPhone: '+1234567890',
      contactEmail: 'jane@test.com',
      secondaryPhone: '+9876543210',
      billingEmail: 'billing@test.com',
      address: '123 Main St',
      city: 'Test City',
      postalCode: '12345',
      province: 'Test Province',
      providerType: 'electricity',
      isActive: true,
      notes: 'Full details test',
      businessHours: '9-5',
      emergencyAvailable: true,
      emergencyPhone: '+1111111111',
      bankAccount: 'ES1234567890',
      paymentTerms: 'Net 30',
      website: 'https://test.com'
    })

    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    const result = await service.run({ provider })

    // Assert
    expect(result).toBeInstanceOf(Provider)
    expect(result.taxId).toBe('ABC123456')
    expect(result.contactEmail).toBe('jane@test.com')
    expect(result.emergencyAvailable).toBe(true)
    expect(mockProviderRepository.save).toHaveBeenCalledWith(provider)
  })

  it('should pass provider to repository save method', async () => {
    // Arrange
    const provider = Provider.create({
      companyName: 'Repository Test',
      contactPerson: 'Test Person',
      contactPhone: '+1234567890',
      providerType: 'analysis',
      isActive: true,
      emergencyAvailable: false
    })

    mockProviderRepository.save = mock().mockResolvedValue(undefined)

    // Act
    await service.run({ provider })

    // Assert
    expect(mockProviderRepository.save).toHaveBeenCalledTimes(1)
    expect(mockProviderRepository.save).toHaveBeenCalledWith(provider)
  })
})
