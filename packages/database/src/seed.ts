import { saltAndHashPassword } from '@pda/common/domain'
import { client } from './client'

const prisma = client

async function main() {
  await deleteAll()

  // Create multiple communities
  const { anceuCommunityId, ponteCaldelasCommunityId } = await seedPlanAndCommunities()

  // // Create users for both communities
  await seedUsers(anceuCommunityId, ponteCaldelasCommunityId)

  // // Create water infrastructure for both communities
  // await seedWaterZones(anceuCommunityId, ponteCaldelasCommunityId)
  // await seedAnalyses(anceuCommunityId, ponteCaldelasCommunityId)
  // const anceuWaterPointIds = await seedWaterPoints(anceuCommunityId)
  // const ponteCaldelasWaterPointIds = await seedWaterPoints(ponteCaldelasCommunityId)
  // await seedHolders()
  // await seedWaterMeters(anceuWaterPointIds, ponteCaldelasWaterPointIds)
  // await seedIssues(anceuCommunityId, ponteCaldelasCommunityId)
  // await seedWaterMeterReadings()
  // await seedMaintenances(anceuCommunityId, ponteCaldelasCommunityId)
  // await seedProviders(anceuCommunityId, ponteCaldelasCommunityId)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function deleteAll() {
  await prisma.user.deleteMany({})
  await prisma.community.deleteMany({})
  await prisma.plan.deleteMany({})
  // await prisma.file.deleteMany({})
  // await prisma.waterMeterReading.deleteMany({})
  // await prisma.waterMeter.deleteMany({})
  // await prisma.waterPoint.deleteMany({})
  // await prisma.waterZone.deleteMany({})
  // await prisma.issue.deleteMany({})
  // await prisma.holder.deleteMany({})
  // await prisma.analysis.deleteMany({})
  // await prisma.maintenance.deleteMany({})
  // await prisma.provider.deleteMany({})
}

async function seedPlanAndCommunities() {
  const plan = await prisma.plan.create({
    data: {
      name: 'Aguas de Galicia'
    }
  })

  const anceuCommunity = await prisma.community.create({
    data: {
      name: 'Anceu',
      planId: plan.id,
      waterLimitRule: {
        type: 'PERSON_BASED',
        value: 150
      }
    }
  })

  const ponteCaldelasCommunity = await prisma.community.create({
    data: {
      name: 'Ponte Caldelas',
      planId: plan.id,
      waterLimitRule: {
        type: 'HOUSEHOLD_BASED',
        value: 220
      }
    }
  })

  return {
    anceuCommunityId: anceuCommunity.id,
    ponteCaldelasCommunityId: ponteCaldelasCommunity.id
  }
}

async function seedUsers(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const users = [
    // Anceu community users
    {
      email: 'admin@anceu.com',
      name: 'Admin Anceu',
      passwordHash: await saltAndHashPassword('admin123'),
      roles: ['COMMUNITY_ADMIN'],
      communityId: anceuCommunityId
    },
    {
      email: 'manager@anceu.com',
      name: 'Manager Anceu',
      passwordHash: await saltAndHashPassword('manager123'),
      roles: ['MANAGER'],
      communityId: anceuCommunityId
    },
    {
      email: 'user1@anceu.com',
      name: 'Usuario 1 Anceu',
      passwordHash: await saltAndHashPassword('user123'),
      roles: ['COMMUNITY_ADMIN'],
      communityId: anceuCommunityId
    },
    {
      email: 'user2@anceu.com',
      name: 'Usuario 2 Anceu',
      passwordHash: await saltAndHashPassword('user123'),
      roles: ['COMMUNITY_ADMIN'],
      communityId: anceuCommunityId
    },
    // Ponte Caldelas community users
    {
      email: 'admin@pontecaldelas.com',
      name: 'Admin Ponte Caldelas',
      passwordHash: await saltAndHashPassword('admin123'),
      roles: ['COMMUNITY_ADMIN'],
      communityId: ponteCaldelasCommunityId
    },
    {
      email: 'user@pontecaldelas.com',
      name: 'Usuario Ponte Caldelas',
      passwordHash: await saltAndHashPassword('user123'),
      roles: ['COMMUNITY_ADMIN'],
      communityId: ponteCaldelasCommunityId
    }
  ]

  await prisma.user.createMany({
    data: users
  })

  console.log('Created users:')
  console.log('- superadmin@puntodeagua.com (password: superadmin123) - SUPER_ADMIN')
  console.log('- admin@anceu.com (password: admin123) - COMMUNITY_ADMIN')
  console.log('- manager@anceu.com (password: manager123) - MANAGER')
  console.log('- user1@anceu.com (password: user123) - COMMUNITY_ADMIN')
  console.log('- user2@anceu.com (password: user123) - COMMUNITY_ADMIN')
  console.log('- admin@pontecaldelas.com (password: admin123) - COMMUNITY_ADMIN')
  console.log('- user@pontecaldelas.com (password: user123) - COMMUNITY_ADMIN')
}
