import { Id } from '@pda/common/domain'
import type { CommunityZone, WaterDeposit } from '@pda/community'
import { CommunityFactory } from '@pda/community'
import { ProvidersFactory } from '@pda/providers'
import { RegistersFactory } from '@pda/registers'
import { UserFactory } from '@pda/user'
import { WaterAccountFactory } from '@pda/water-account'
import { TRPCError } from '@trpc/server'
import type { CommunityScope } from '@/server/api/trpc'

/**
 * Resource guards. Every one takes the caller's CommunityScope and returns
 * early for a global admin, so the ADMIN role is handled in exactly one place
 * per guard instead of at every call site.
 */

export async function assertWaterMeterBelongsToScope(
  waterMeterId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const waterMeterRepo = WaterAccountFactory.waterMeterPrismaRepository()
  const zoneRepo = CommunityFactory.communityZonePrismaRepository()

  const waterMeter = await waterMeterRepo.findById(Id.fromString(waterMeterId))
  if (!waterMeter) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Water meter not found' })
  }

  const zone = await zoneRepo.findById(waterMeter.waterPoint.communityZoneId)
  if (!zone || zone.communityId.toString() !== scope.communityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Water meter does not belong to user community'
    })
  }
}

export async function assertReadingBelongsToScope(
  readingId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const readingRepo = WaterAccountFactory.waterMeterReadingPrismaRepository()
  const reading = await readingRepo.findById(Id.fromString(readingId))
  if (!reading) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Water meter reading not found' })
  }
  await assertWaterMeterBelongsToScope(reading.waterMeterId.toString(), scope)
}

export async function assertWaterPointBelongsToScope(
  waterPointId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const waterPointRepo = CommunityFactory.waterPointPrismaRepository()
  const zoneRepo = CommunityFactory.communityZonePrismaRepository()

  const waterPoint = await waterPointRepo.findById(Id.fromString(waterPointId))
  if (!waterPoint) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Water point not found' })
  }

  const zone = await zoneRepo.findById(waterPoint.communityZoneId)
  if (!zone || zone.communityId.toString() !== scope.communityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Water point does not belong to user community'
    })
  }
}

export async function assertZoneIdsBelongToScope(
  zoneIds: string[],
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const zoneRepo = CommunityFactory.communityZonePrismaRepository()
  const communityZones = await zoneRepo.findByCommunityId(Id.fromString(scope.communityId))
  const allowedZoneIds = new Set(communityZones.map((zone: CommunityZone) => zone.id.toString()))

  if (!zoneIds.every((zoneId) => allowedZoneIds.has(zoneId))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Zone does not belong to user community' })
  }
}

/**
 * Asserts a community id received as input is the caller's own.
 *
 * Taking the community from ctx.scope and dropping the input parameter would be
 * stronger, since cross-community access would stop being expressible at all.
 * That is a follow-up: it changes the signature of endpoints with a dozen
 * call sites in the frontend.
 */
export function assertCommunityInScope(communityId: string, scope: CommunityScope): void {
  if (scope.kind === 'global') return
  if (communityId !== scope.communityId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Community access denied' })
  }
}

/**
 * Asserts every deposit belongs to the caller's community.
 */
export async function assertDepositsBelongToScope(
  depositIds: string[],
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global' || depositIds.length === 0) return

  const depositRepo = CommunityFactory.waterDepositPrismaRepository()
  const deposits = await depositRepo.findByIds(depositIds.map((id) => Id.fromString(id)))
  const allOwned =
    deposits.length === depositIds.length &&
    deposits.every((deposit: WaterDeposit) => deposit.communityId.toString() === scope.communityId)

  if (!allOwned) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Water deposit does not belong to user community'
    })
  }
}

/**
 * Asserts a community id taken from an input matches the caller's own.
 * Prefer assertCommunityInScope, which understands the global admin scope.
 */
export function assertCommunityAccess(
  requestedCommunityId: string,
  userCommunityId: string | undefined
): void {
  if (!userCommunityId || requestedCommunityId !== userCommunityId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Community access denied' })
  }
}

export async function assertIncidentBelongsToScope(
  incidentId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const incidentRepo = RegistersFactory.incidentPrismaRepository()
  const incident = await incidentRepo.findById(Id.fromString(incidentId))
  if (!incident) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Incident not found' })
  }
  assertCommunityInScope(incident.communityId.toString(), scope)
}

export async function assertIncidentImageBelongsToScope(
  imageId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const imageRepo = RegistersFactory.incidentImagePrismaRepository()
  const image = await imageRepo.findById(Id.fromString(imageId))
  if (!image) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Incident image not found' })
  }
  await assertIncidentBelongsToScope(image.incidentId.toString(), scope)
}

export async function assertAnalysisBelongsToScope(
  analysisId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const analysisRepo = RegistersFactory.analysisPrismaRepository()
  const analysis = await analysisRepo.findById(Id.fromString(analysisId))
  if (!analysis) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Analysis not found' })
  }
  assertCommunityInScope(analysis.communityId.toString(), scope)
}

export async function assertProviderBelongsToScope(
  providerId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const providerRepo = ProvidersFactory.providerPrismaRepository()
  const provider = await providerRepo.findById(Id.fromString(providerId))
  if (!provider) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Provider not found' })
  }
  // Provider.communityId is optional in the schema, so a provider can belong to
  // nobody. Those are not reachable from a community-scoped caller.
  if (!provider.communityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Provider does not belong to any community'
    })
  }
  assertCommunityInScope(provider.communityId.toString(), scope)
}

export async function assertUserBelongsToScope(
  userId: string,
  scope: CommunityScope
): Promise<void> {
  if (scope.kind === 'global') return

  const userRepo = UserFactory.userPrismaRepository()
  const user = await userRepo.findById(Id.fromString(userId))
  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
  }
  if (!user.community) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User does not belong to any community' })
  }
  assertCommunityInScope(user.community.id.toString(), scope)
}
