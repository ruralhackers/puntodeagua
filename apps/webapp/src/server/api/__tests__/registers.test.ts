import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunity,
  anAnalysis,
  anIncident,
  anIncidentImage,
  aProvider,
  asManagerOf,
  expectForbidden,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('incident router', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject listing incidents of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    await anIncident({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.incidents.getIncidentsByCommunityId({ id: other.id }))
  })

  it('should reject reading an incident of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const incident = await anIncident({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.incidents.getIncidentById({ id: incident.id }))
  })

  it('should reject creating an incident in another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(
      caller.incidents.addIncident({
        title: 'Injected',
        reporterName: 'Attacker',
        startAt: new Date('2026-01-01'),
        communityId: other.id,
        status: 'open'
      })
    )
  })

  it('should reject deleting an incident of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const incident = await anIncident({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.incidents.deleteIncident({ id: incident.id }))
  })

  it('should reject exporting incidents of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(
      caller.incidents.exportIncidents({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        communityId: other.id
      })
    )
  })

  it('should reject deleting an incident image of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const incident = await anIncident({ communityId: other.id })
    const image = await anIncidentImage({ incidentId: incident.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.incidents.deleteIncidentImage({ imageId: image.id }))
  })

  it('should allow listing incidents of the caller community', async () => {
    // Arrange
    const own = await aCommunity()
    const incident = await anIncident({ communityId: own.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act
    const incidents = await caller.incidents.getIncidentsByCommunityId({ id: own.id })

    // Assert
    expect(incidents.map((item) => item.id)).toContain(incident.id)
  })
})

describe('analysis router', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject listing analyses of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    await anAnalysis({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.registers.getAnalysesByCommunityId({ id: other.id }))
  })

  it('should reject creating an analysis in another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(
      caller.registers.addAnalysis({
        communityId: other.id,
        analysisType: 'chlorine_ph',
        analyst: 'Attacker',
        analyzedAt: new Date('2026-01-01'),
        ph: 7,
        chlorine: 1
      })
    )
  })

  it('should reject exporting analyses of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(
      caller.registers.exportAnalyses({
        analysisTypes: ['chlorine_ph'],
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        communityId: other.id
      })
    )
  })
})

describe('provider router', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject listing providers of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    await aProvider({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.providers.getProvidersByCommunityId({ id: other.id }))
  })

  it('should reject reading a provider of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const provider = await aProvider({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.providers.getProviderById({ id: provider.id }))
  })

  it('should reject deleting a provider of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const provider = await aProvider({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.providers.deleteProvider({ id: provider.id }))
  })

  it('should reject toggling a provider of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const provider = await aProvider({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(
      caller.providers.toggleProviderActive({ id: provider.id, isActive: false })
    )
  })

  it('should allow listing providers of the caller community', async () => {
    // Arrange
    const own = await aCommunity()
    const provider = await aProvider({ communityId: own.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act
    const providers = await caller.providers.getProvidersByCommunityId({ id: own.id })

    // Assert
    expect(providers.map((item) => item.id)).toContain(provider.id)
  })
})
