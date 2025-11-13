import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Provider } from '../../domain/entities/provider'
import type { ProviderDto } from '../../domain/entities/provider.dto'
import { ProviderType } from '../../domain/value-objects/provider-type'

describe('Provider', () => {
  const validCommunityId = 'clx12345678901234567890123'

  describe('create()', () => {
    it('should create provider with all required fields', () => {
      // Arrange
      const dto = {
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'plumbing' as const,
        isActive: true,
        emergencyAvailable: false
      }

      // Act
      const provider = Provider.create(dto)

      // Assert
      expect(provider.id).toBeInstanceOf(Id)
      expect(provider.companyName).toBe('Test Company')
      expect(provider.contactPerson).toBe('John Doe')
      expect(provider.contactPhone).toBe('+1234567890')
      expect(provider.providerType.equals(ProviderType.PLUMBING)).toBe(true)
      expect(provider.isActive).toBe(true)
      expect(provider.emergencyAvailable).toBe(false)
    })

    it('should create provider with optional fields', () => {
      // Arrange
      const dto = {
        companyName: 'Test Company',
        taxId: 'ABC123456',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@test.com',
        secondaryPhone: '+9876543210',
        billingEmail: 'billing@test.com',
        address: '123 Main St',
        city: 'Test City',
        postalCode: '12345',
        province: 'Test Province',
        providerType: 'electricity' as const,
        isActive: true,
        notes: 'Test notes',
        businessHours: '9-5',
        emergencyAvailable: true,
        emergencyPhone: '+1111111111',
        bankAccount: 'ES1234567890',
        paymentTerms: 'Net 30',
        website: 'https://test.com',
        communityId: validCommunityId
      }

      // Act
      const provider = Provider.create(dto)

      // Assert
      expect(provider.taxId).toBe('ABC123456')
      expect(provider.contactEmail).toBe('john@test.com')
      expect(provider.secondaryPhone).toBe('+9876543210')
      expect(provider.billingEmail).toBe('billing@test.com')
      expect(provider.address).toBe('123 Main St')
      expect(provider.city).toBe('Test City')
      expect(provider.postalCode).toBe('12345')
      expect(provider.province).toBe('Test Province')
      expect(provider.notes).toBe('Test notes')
      expect(provider.businessHours).toBe('9-5')
      expect(provider.emergencyAvailable).toBe(true)
      expect(provider.emergencyPhone).toBe('+1111111111')
      expect(provider.bankAccount).toBe('ES1234567890')
      expect(provider.paymentTerms).toBe('Net 30')
      expect(provider.website).toBe('https://test.com')
      expect(provider.communityId?.toString()).toBe(validCommunityId)
    })
  })

  describe('fromDto()', () => {
    it('should create provider from complete DTO', () => {
      // Arrange
      const dto: ProviderDto = {
        id: 'clx22222222222222222222222',
        companyName: 'Test Company',
        taxId: 'ABC123456',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@test.com',
        secondaryPhone: '+9876543210',
        billingEmail: 'billing@test.com',
        address: '123 Main St',
        city: 'Test City',
        postalCode: '12345',
        province: 'Test Province',
        providerType: 'analysis',
        isActive: true,
        notes: 'Test notes',
        businessHours: '9-5',
        emergencyAvailable: true,
        emergencyPhone: '+1111111111',
        bankAccount: 'ES1234567890',
        paymentTerms: 'Net 30',
        website: 'https://test.com',
        communityId: validCommunityId
      }

      // Act
      const provider = Provider.fromDto(dto)

      // Assert
      expect(provider.id.toString()).toBe('clx22222222222222222222222')
      expect(provider.companyName).toBe('Test Company')
      expect(provider.taxId).toBe('ABC123456')
      expect(provider.contactPerson).toBe('John Doe')
      expect(provider.providerType.equals(ProviderType.ANALYSIS)).toBe(true)
      expect(provider.isActive).toBe(true)
    })

    it('should create provider from DTO with optional fields as undefined', () => {
      // Arrange
      const dto: ProviderDto = {
        id: 'clx33333333333333333333333',
        companyName: 'Minimal Company',
        contactPerson: 'Jane Smith',
        contactPhone: '+9876543210',
        providerType: 'masonry',
        isActive: false,
        emergencyAvailable: false
      }

      // Act
      const provider = Provider.fromDto(dto)

      // Assert
      expect(provider.taxId).toBeUndefined()
      expect(provider.contactEmail).toBeUndefined()
      expect(provider.secondaryPhone).toBeUndefined()
      expect(provider.address).toBeUndefined()
      expect(provider.communityId).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('should convert entity to DTO with all fields', () => {
      // Arrange
      const dto: ProviderDto = {
        id: 'clx44444444444444444444444',
        companyName: 'Test Company',
        taxId: 'ABC123456',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@test.com',
        secondaryPhone: '+9876543210',
        billingEmail: 'billing@test.com',
        address: '123 Main St',
        city: 'Test City',
        postalCode: '12345',
        province: 'Test Province',
        providerType: 'plumbing',
        isActive: true,
        notes: 'Test notes',
        businessHours: '9-5',
        emergencyAvailable: true,
        emergencyPhone: '+1111111111',
        bankAccount: 'ES1234567890',
        paymentTerms: 'Net 30',
        website: 'https://test.com',
        communityId: validCommunityId
      }
      const provider = Provider.fromDto(dto)

      // Act
      const resultDto = provider.toDto()

      // Assert
      expect(resultDto).toEqual(dto)
    })

    it('should convert entity to DTO with optional fields as undefined', () => {
      // Arrange
      const dto: ProviderDto = {
        id: 'clx55555555555555555555555',
        companyName: 'Minimal Company',
        contactPerson: 'Jane Smith',
        contactPhone: '+9876543210',
        providerType: 'electricity',
        isActive: false,
        emergencyAvailable: false
      }
      const provider = Provider.fromDto(dto)

      // Act
      const resultDto = provider.toDto()

      // Assert
      expect(resultDto).toEqual(dto)
    })
  })

  describe('update()', () => {
    it('should update provider successfully', () => {
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

      // Act
      provider.update(updateData)

      // Assert
      expect(provider.providerType.equals(ProviderType.ELECTRICITY)).toBe(true)
      expect(provider.isActive).toBe(false)
      expect(provider.notes).toBe('Updated notes')
    })
  })

  describe('data integrity', () => {
    it('should preserve data through create -> toDto -> fromDto round trip', () => {
      // Arrange
      const originalDto = {
        companyName: 'Round Trip Company',
        taxId: 'ABC123456',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@test.com',
        address: '123 Main St',
        city: 'Test City',
        providerType: 'analysis' as const,
        isActive: true,
        notes: 'Round trip test',
        emergencyAvailable: true,
        communityId: validCommunityId
      }

      // Act
      const provider = Provider.create(originalDto)
      const dto = provider.toDto()
      const reconstructedProvider = Provider.fromDto(dto)

      // Assert
      expect(reconstructedProvider.companyName).toBe(originalDto.companyName)
      expect(reconstructedProvider.taxId).toBe(originalDto.taxId)
      expect(reconstructedProvider.contactPerson).toBe(originalDto.contactPerson)
      expect(reconstructedProvider.contactPhone).toBe(originalDto.contactPhone)
      expect(reconstructedProvider.providerType.toString()).toBe(originalDto.providerType)
      expect(reconstructedProvider.isActive).toBe(originalDto.isActive)
      expect(reconstructedProvider.notes).toBe(originalDto.notes)
      expect(reconstructedProvider.communityId?.toString()).toBe(originalDto.communityId)
    })

    it('should generate unique IDs across multiple creations', () => {
      // Arrange
      const dto1 = {
        companyName: 'Company 1',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'plumbing' as const,
        isActive: true,
        emergencyAvailable: false
      }
      const dto2 = {
        companyName: 'Company 2',
        contactPerson: 'Jane Smith',
        contactPhone: '+9876543210',
        providerType: 'electricity' as const,
        isActive: true,
        emergencyAvailable: false
      }

      // Act
      const provider1 = Provider.create(dto1)
      const provider2 = Provider.create(dto2)

      // Assert
      expect(provider1.id.toString()).not.toBe(provider2.id.toString())
    })
  })

  describe('edge cases', () => {
    it('should handle empty string email fields', () => {
      // Arrange
      const provider = Provider.create({
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: '',
        billingEmail: '',
        providerType: 'plumbing',
        isActive: true,
        emergencyAvailable: false
      })

      // Act & Assert
      expect(provider.contactEmail).toBeUndefined()
      expect(provider.billingEmail).toBeUndefined()
    })

    it('should handle empty string website field', () => {
      // Arrange
      const provider = Provider.create({
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        website: '',
        providerType: 'masonry',
        isActive: true,
        emergencyAvailable: false
      })

      // Act & Assert
      expect(provider.website).toBeUndefined()
    })

    it('should handle long notes text', () => {
      // Arrange
      const longNotes = 'A'.repeat(5000)
      const provider = Provider.create({
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'electricity',
        notes: longNotes,
        isActive: true,
        emergencyAvailable: false
      })

      // Act & Assert
      expect(provider.notes).toBe(longNotes)
    })
  })

  describe('integration with dependencies', () => {
    it('should propagate errors from invalid Id format', () => {
      // Arrange
      const dto = {
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'plumbing' as const,
        communityId: 'invalid-id',
        isActive: true,
        emergencyAvailable: false
      }

      // Act & Assert
      expect(() => Provider.create(dto)).toThrow()
    })

    it('should propagate errors from invalid ProviderType', () => {
      // Arrange
      const dto = {
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'invalid_type' as never,
        isActive: true,
        emergencyAvailable: false
      }

      // Act & Assert
      expect(() => Provider.create(dto)).toThrow()
    })

    it('should integrate correctly with Id class', () => {
      // Arrange
      const provider = Provider.create({
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'plumbing',
        communityId: validCommunityId,
        isActive: true,
        emergencyAvailable: false
      })

      // Act & Assert
      expect(provider.id).toBeInstanceOf(Id)
      expect(provider.communityId).toBeInstanceOf(Id)
      expect(Id.isValidIdentifier(provider.id.toString())).toBe(true)
      expect(Id.isValidIdentifier(provider.communityId!.toString())).toBe(true)
    })

    it('should integrate correctly with ProviderType class', () => {
      // Arrange
      const provider = Provider.create({
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        providerType: 'electricity',
        isActive: true,
        emergencyAvailable: false
      })

      // Act & Assert
      expect(provider.providerType).toBeInstanceOf(ProviderType)
      expect(provider.providerType.equals(ProviderType.ELECTRICITY)).toBe(true)
      expect(provider.providerType.toString()).toBe('electricity')
    })
  })
})
