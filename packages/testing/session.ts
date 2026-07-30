import { client as prisma } from '@pda/database'

interface TestSessionUser {
  id: string
  name: string | null
  email: string | null
  roles: string[]
  community: { id: string; name: string; waterLimitRule: { type: string; value: number } } | null
}

export interface TestContext {
  db: typeof prisma
  session: { user: TestSessionUser; expires: string } | null
  headers: Headers
}

const FAR_FUTURE = '2099-01-01T00:00:00.000Z'

function contextFor(roles: string[], communityId: string | null): TestContext {
  return {
    db: prisma,
    session: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        roles,
        community: communityId
          ? {
              id: communityId,
              name: 'Test Community',
              waterLimitRule: { type: 'PERSON_BASED', value: 100 }
            }
          : null
      },
      expires: FAR_FUTURE
    },
    headers: new Headers()
  }
}

export function asAdmin(communityId: string | null = null): TestContext {
  return contextFor(['ADMIN'], communityId)
}

export function asCommunityAdminOf(communityId: string): TestContext {
  return contextFor(['COMMUNITY_ADMIN'], communityId)
}

export function asManagerOf(communityId: string): TestContext {
  return contextFor(['MANAGER'], communityId)
}

export function asReaderOf(communityId: string): TestContext {
  return contextFor(['WATER_METER_READER'], communityId)
}

export function asAnonymous(): TestContext {
  return { db: prisma, session: null, headers: new Headers() }
}

// A non-admin staff user with no community: must be rejected by
// communityScopedProcedure, unlike an ADMIN in the same situation.
export function asManagerWithoutCommunity(): TestContext {
  return contextFor(['MANAGER'], null)
}
