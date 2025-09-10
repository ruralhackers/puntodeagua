import { client } from './client'
import { Client } from 'pg'

const prisma = client

interface StagingUser {
  id: string
  email: string | null
  username: string | null
  locked_at: Date | null
  created_at: Date
  updated_at: Date
  credits: number
  admin: boolean
  moderator: boolean
  verified: boolean
  banned: boolean
  nsfw: boolean
  profile_view_count: number
  prompt_count: number
  fav_count: number
  search_count: number
  streak_days: number
  streak_start: Date | null
  streak_end: Date | null
}

async function connectToStaging() {
  const stagingClient = new Client({
    connectionString: process.env.STAGING_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  await stagingClient.connect()
  return stagingClient
}

async function fetchUsersFromStaging(stagingClient: Client) {
  const query = `
    SELECT
      id, email, username, locked_at, created_at, updated_at,
      credits, admin, moderator, verified, banned, nsfw,
      profile_view_count, prompt_count, fav_count, search_count,
      streak_days, streak_start, streak_end
    FROM users
    ORDER BY created_at ASC
    LIMIT 100
  `

  const result = await stagingClient.query<StagingUser>(query)
  return result.rows
}

async function createUsersInPrisma(users: StagingUser[]) {
  console.log(`Creating ${users.length} users in Prisma...`)

  for (const [index, user] of users.entries()) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          username: user.username,
          lockedAt: user.locked_at,
          updatedAt: user.updated_at,
          credits: user.credits,
          admin: user.admin || false,
          moderator: user.moderator || false,
          verified: user.verified || false,
          banned: user.banned || false,
          nsfw: user.nsfw || false,
          profileViewCount: user.profile_view_count || 0,
          promptCount: user.prompt_count || 0,
          favCount: user.fav_count || 0,
          searchCount: user.search_count || 0,
          streakDays: user.streak_days || 0,
          streakStart: user.streak_start || null,
          streakEnd: user.streak_end || null
        },
        create: {
          id: user.id,
          email: user.email,
          username: user.username,
          lockedAt: user.locked_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          credits: user.credits,
          admin: user.admin || false,
          moderator: user.moderator || false,
          verified: user.verified || false,
          banned: user.banned || false,
          nsfw: user.nsfw || false,
          profileViewCount: user.profile_view_count || 0,
          promptCount: user.prompt_count,
          favCount: user.fav_count,
          searchCount: user.search_count,
          streakDays: user.streak_days,
          streakStart: user.streak_start,
          streakEnd: user.streak_end
        }
      })

      if (index % 10 === 0) {
        console.log(`Processed ${index + 1}/${users.length} users`)
      }
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error)
    }
  }
}

async function main() {
  let stagingClient: Client | null = null

  try {
    console.log('Connecting to staging database...')
    stagingClient = await connectToStaging()

    console.log('Fetching users from staging...')
    const users = await fetchUsersFromStaging(stagingClient)

    console.log(`Found ${users.length} users in staging`)

    await createUsersInPrisma(users)

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    if (stagingClient) {
      await stagingClient.end()
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })