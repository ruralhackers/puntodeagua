import { seedCommunity } from './seed-community'

async function main() {
  console.log('Starting seed data...', process.argv)
  const communityName = process.argv[2]
  if (!communityName) {
    console.error('❌ Usage: bun run seed <community-name>')
    console.error('Example: bun run seed anceu')
    process.exit(1)
  }

  await seedCommunity(communityName)
}

main().catch((e) => {
  console.error('\n❌ Seed failed:', e)
  process.exit(1)
})
