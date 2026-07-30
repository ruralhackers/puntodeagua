// Entities
export { Community } from './entities/community'
export {
  type CommunityClientDto,
  type CommunityDto,
  communityClientSchema,
  communitySchema
} from './entities/community.dto'
export { CommunityZone } from './entities/community-zone'
export type { CommunityZoneDto } from './entities/community-zone.dto'
export { WaterDeposit } from './entities/water-deposit'
export { type WaterDepositDto, waterDepositSchema } from './entities/water-deposit.dto'
export { WaterPoint } from './entities/water-point'
export { type WaterPointDto, waterPointSchema } from './entities/water-point.dto'
export { DuplicateConnectionNumberError } from './errors/water-point-errors'

// Repositories
export type { CommunityRepository } from './repositories/community.repository'
export type { CommunityZoneRepository } from './repositories/community-zone.repository'
export type { WaterDepositRepository } from './repositories/water-deposit.repository'
export type { WaterPointRepository } from './repositories/water-point.repository'
