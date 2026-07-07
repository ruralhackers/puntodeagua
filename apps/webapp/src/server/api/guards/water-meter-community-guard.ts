import { Id } from '@pda/common/domain'
import { CommunityFactory } from '@pda/community'
import { WaterAccountFactory } from '@pda/water-account'
import { TRPCError } from '@trpc/server'

export async function assertWaterMeterBelongsToUserCommunity(
  waterMeterId: string,
  userCommunityId: string | undefined
): Promise<void> {
  if (!userCommunityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User has no community assigned'
    })
  }

  const waterMeterRepo = WaterAccountFactory.waterMeterPrismaRepository()
  const zoneRepo = CommunityFactory.communityZonePrismaRepository()

  const waterMeter = await waterMeterRepo.findById(Id.fromString(waterMeterId))
  if (!waterMeter) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Water meter not found'
    })
  }

  const zone = await zoneRepo.findById(waterMeter.waterPoint.communityZoneId)
  if (!zone || zone.communityId.toString() !== userCommunityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Water meter does not belong to user community'
    })
  }
}

export async function assertZoneIdsBelongToUserCommunity(
  zoneIds: string[],
  userCommunityId: string | undefined
): Promise<void> {
  if (!userCommunityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User has no community assigned'
    })
  }

  const zoneRepo = CommunityFactory.communityZonePrismaRepository()
  const communityZones = await zoneRepo.findByCommunityId(Id.fromString(userCommunityId))
  const allowedZoneIds = new Set(communityZones.map((zone) => zone.id.toString()))

  if (!zoneIds.every((zoneId) => allowedZoneIds.has(zoneId))) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Zone does not belong to user community'
    })
  }
}

export function assertCommunityAccess(
  requestedCommunityId: string,
  userCommunityId: string | undefined
): void {
  if (!userCommunityId || requestedCommunityId !== userCommunityId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Community access denied'
    })
  }
}
