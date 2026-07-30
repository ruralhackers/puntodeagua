import { Id } from '@pda/common/domain'
import { CommunityFactory } from '@pda/community'
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
  const allowedZoneIds = new Set(communityZones.map((zone) => zone.id.toString()))

  if (!zoneIds.every((zoneId) => allowedZoneIds.has(zoneId))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Zone does not belong to user community' })
  }
}

/**
 * Asserts a community id taken from an input matches the caller's own.
 * Prefer taking the community from ctx.scope; this exists for the endpoints
 * that have not been migrated yet.
 */
export function assertCommunityAccess(
  requestedCommunityId: string,
  userCommunityId: string | undefined
): void {
  if (!userCommunityId || requestedCommunityId !== userCommunityId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Community access denied' })
  }
}
