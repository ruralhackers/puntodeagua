import { client as prisma } from '@pda/database'

// Monotonic counter so two calls never collide on a @unique field.
let seq = 0
const next = () => ++seq

export async function aCommunity(overrides: Record<string, unknown> = {}) {
  return prisma.community.create({
    data: {
      name: `Community ${next()}`,
      waterLimitRule: { type: 'PERSON_BASED', value: 100 },
      ...overrides
    }
  })
}

export async function aCommunityZone(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.communityZone.create({
    data: { name: `Zone ${next()}`, communityId, ...overrides }
  })
}

export async function aWaterDeposit(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.waterDeposit.create({
    data: { name: `Deposit ${next()}`, location: '0,0', communityId, ...overrides }
  })
}

export async function aWaterPoint(params: { communityZoneId: string } & Record<string, unknown>) {
  const { communityZoneId, ...overrides } = params
  return prisma.waterPoint.create({
    data: {
      name: `Water Point ${next()}`,
      location: '0,0',
      fixedPopulation: 2,
      floatingPopulation: 0,
      cadastralReference: `CAD-${next()}`,
      waterDepositIds: [],
      communityZoneId,
      ...overrides
    }
  })
}

export async function aWaterAccount(overrides: Record<string, unknown> = {}) {
  return prisma.waterAccount.create({
    data: { name: `Account ${next()}`, nationalId: `ID-${next()}`, ...overrides }
  })
}

export async function aWaterMeter(
  params: { waterPointId: string; waterAccountId: string } & Record<string, unknown>
) {
  const { waterPointId, waterAccountId, ...overrides } = params
  return prisma.waterMeter.create({
    data: {
      name: `Meter ${next()}`,
      measurementUnit: 'L',
      isActive: true,
      waterPointId,
      waterAccountId,
      ...overrides
    }
  })
}

export async function aReading(params: { waterMeterId: string } & Record<string, unknown>) {
  const { waterMeterId, ...overrides } = params
  return prisma.waterMeterReading.create({
    data: {
      reading: '100',
      normalizedReading: 100,
      readingDate: new Date('2026-01-01'),
      waterMeterId,
      ...overrides
    }
  })
}

export async function anIncident(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.incident.create({
    data: {
      title: `Incident ${next()}`,
      reporterName: 'Reporter',
      status: 'open',
      startAt: new Date('2026-01-01'),
      communityId,
      ...overrides
    }
  })
}

export async function anAnalysis(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.analysis.create({
    data: {
      analysisType: 'chlorine_ph',
      analyst: 'Analyst',
      analyzedAt: new Date('2026-01-01'),
      // ph, turbidity and chlorine are String? in the schema, not numbers.
      ph: '7',
      chlorine: '1',
      communityId,
      ...overrides
    }
  })
}

export async function aProvider(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.provider.create({
    data: {
      companyName: `Provider ${next()}`,
      contactPerson: 'Contact',
      contactPhone: '600000000',
      providerType: 'plumbing',
      communityId,
      ...overrides
    }
  })
}

export async function aUser(
  params: { communityId?: string; roles?: string[] } & Record<string, unknown> = {}
) {
  const { communityId, roles = ['MANAGER'], ...overrides } = params
  return prisma.user.create({
    data: {
      email: `user${next()}@example.com`,
      name: `User ${next()}`,
      passwordHash: '$2a$10$notARealHashJustForTests',
      roles,
      communityId,
      ...overrides
    }
  })
}

// Two of these give you two fully independent communities, which is what every
// cross-tenant test needs.
export async function aCommunityWithFullSetup() {
  const community = await aCommunity()
  const zone = await aCommunityZone({ communityId: community.id })
  const waterPoint = await aWaterPoint({ communityZoneId: zone.id })
  const account = await aWaterAccount()
  const meter = await aWaterMeter({ waterPointId: waterPoint.id, waterAccountId: account.id })
  const reading = await aReading({ waterMeterId: meter.id })
  return { community, zone, waterPoint, account, meter, reading }
}
