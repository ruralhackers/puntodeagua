import { client } from './client'

const prisma = client

async function main() {
  const communityId = await seedCommunity()
  await seedWaterPoints(communityId)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


async function seedCommunity(){
  const COMMUNITY = {
    name: 'Anceu',
    plan: 'Plan A',
  }
  const community = await prisma.community.create({
    data: COMMUNITY
  })
  return community.id
}

const WATER_POINTS = [
  {
    name: 'Water Point 1',
    location: 'Location 1',
  },
  {
    name: 'Water Point 2',
    location: 'Location 2',
  }
]



async function seedWaterPoints(communityId: string) {
  await prisma.waterPoint.deleteMany({})
  await prisma.waterPoint.createMany({
    data: WATER_POINTS.map((wp) => ({
      ...wp,
      communityId
    }))
  })
}