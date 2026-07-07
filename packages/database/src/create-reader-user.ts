import { saltAndHashPassword } from '@pda/common/domain'
import { client } from './client'

const prisma = client

/**
 * Creates (or updates) a single WATER_METER_READER user WITHOUT wiping the database.
 *
 * Usage:
 *   # List available communities to find the communityId
 *   bun run --filter @pda/database create:reader -- --list
 *
 *   # Create the reader user
 *   bun run --filter @pda/database create:reader -- \
 *     --email=lector@anceu.com --password=secret123 --community=<communityId> [--name="Lector"]
 */

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {}
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const [rawKey, ...rest] = arg.slice(2).split('=')
    const key = rawKey ?? ''
    if (!key) continue
    args[key] = rest.length > 0 ? rest.join('=') : true
  }
  return args
}

async function listCommunities() {
  const communities = await prisma.community.findMany({
    select: { id: true, name: true }
  })

  if (communities.length === 0) {
    console.log('No communities found in the database.')
    return
  }

  console.log('Available communities:')
  for (const community of communities) {
    console.log(`- ${community.name}: ${community.id}`)
  }
}

async function createReader(params: {
  email: string
  password: string
  communityId: string
  name?: string
}) {
  const { email, password, communityId, name } = params

  const community = await prisma.community.findUnique({ where: { id: communityId } })
  if (!community) {
    throw new Error(`Community not found for id: ${communityId}`)
  }

  const passwordHash = await saltAndHashPassword(password)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      roles: ['WATER_METER_READER'],
      communityId,
      name: name ?? undefined
    },
    create: {
      email,
      name: name ?? 'Lector de contadores',
      passwordHash,
      roles: ['WATER_METER_READER'],
      communityId
    }
  })

  console.log('WATER_METER_READER user ready:')
  console.log(`- id:        ${user.id}`)
  console.log(`- email:     ${user.email}`)
  console.log(`- community: ${community.name} (${communityId})`)
  console.log(`- roles:     ${user.roles.join(', ')}`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.list) {
    await listCommunities()
    return
  }

  const email = typeof args.email === 'string' ? args.email : undefined
  const password = typeof args.password === 'string' ? args.password : undefined
  const communityId = typeof args.community === 'string' ? args.community : undefined
  const name = typeof args.name === 'string' ? args.name : undefined

  if (!email || !password || !communityId) {
    console.error(
      'Missing required arguments.\n\n' +
        'List communities:\n' +
        '  bun run --filter @pda/database create:reader -- --list\n\n' +
        'Create reader user:\n' +
        '  bun run --filter @pda/database create:reader -- ' +
        '--email=<email> --password=<password> --community=<communityId> [--name="Full Name"]'
    )
    process.exit(1)
  }

  await createReader({ email, password, communityId, name })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
