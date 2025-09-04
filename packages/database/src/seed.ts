import bcrypt from 'bcrypt'
import { client } from './client'

const prisma = client

async function main() {
  await seedUsers()
  const communityId = await seedPlanAndCommunity()
  await seedWaterZones(communityId)
  const waterPointIds = await seedWaterPoints(communityId)
  await seedHolders()
  await seedWaterMeters(waterPointIds)
  await seedIssues(communityId)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function seedUsers() {
  // Delete existing users first
  await prisma.user.deleteMany({})

  const saltRounds = 10

  const users = [
    {
      email: 'admin@puntodeagua.com',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', saltRounds),
      roles: ['admin']
    },
    {
      email: 'user@puntodeagua.com',
      name: 'Regular User',
      password: await bcrypt.hash('user123', saltRounds),
      roles: ['user']
    },
    {
      email: 'manager@puntodeagua.com',
      name: 'Manager User',
      password: await bcrypt.hash('manager123', saltRounds),
      roles: ['manager', 'user']
    }
  ]

  await prisma.user.createMany({
    data: users
  })

  console.log('Created users:')
  console.log('- admin@puntodeagua.com (password: admin123)')
  console.log('- user@puntodeagua.com (password: user123)')
  console.log('- manager@puntodeagua.com (password: manager123)')
}

async function seedPlanAndCommunity() {
  const plan = await prisma.plan.create({
    data: {
      name: 'Aguas de Galicia'
    }
  })

  const COMMUNITY = {
    name: 'Anceu',
    planId: plan.id
  }

  const community = await prisma.community.create({
    data: COMMUNITY
  })
  return community.id
}

const WATER_POINTS = [
  {
    name: 'Water Point 1',
    location: '42.359987,-8.4669443',
    description: 'This is a description for Water Point 1'
  },
  {
    name: 'Water Point 2',
    location: '42.359987,-8.4669443',
    description: 'This is a description for Water Point 2'
  }
]

async function seedWaterPoints(communityId: string) {
  await prisma.waterPoint.deleteMany({})
  const waterPoints = await prisma.waterPoint.createManyAndReturn({
    data: WATER_POINTS.map((wp) => ({
      ...wp,
      communityId
    }))
  })
  return waterPoints.map((wp) => wp.id)
}

async function seedWaterZones(communityId: string) {
  await prisma.waterZone.deleteMany({})
  await prisma.waterZone.createMany({
    data: [
      {
        name: 'Os Casas',
        communityId
      },
      {
        name: 'Centro',
        communityId
      },
      {
        name: 'Ramis',
        communityId
      }
    ]
  })
}

const HOLDERS = [
  {
    name: 'Juan García'
  },
  {
    name: 'María López'
  },
  {
    name: 'Carlos Rodríguez'
  },
  {
    name: 'Ana Martínez'
  }
]

async function seedHolders() {
  await prisma.holder.deleteMany({})
  await prisma.holder.createMany({
    data: HOLDERS
  })
}

async function seedWaterMeters(waterPointIds: string[]) {
  await prisma.waterMeter.deleteMany({})

  const holders = await prisma.holder.findMany()
  const waterZones = await prisma.waterZone.findMany()

  const waterMeters = [
    {
      name: 'Meter WP1-001',
      holderId: holders[0].id,
      waterPointId: waterPointIds[0],
      waterZoneId: waterZones[0].id, // Os Casas
      measurementUnit: 'L',
      images: ['https://example.com/meter1.jpg', 'https://example.com/meter1_detail.jpg']
    },
    {
      name: 'Meter WP1-002',
      holderId: holders[1].id,
      waterPointId: waterPointIds[0],
      waterZoneId: waterZones[1].id, // Centro
      measurementUnit: 'M3',
      images: ['https://example.com/meter2.jpg']
    },
    {
      name: 'Meter WP2-001',
      holderId: holders[2].id,
      waterPointId: waterPointIds[1],
      waterZoneId: waterZones[1].id, // Centro
      measurementUnit: 'L',
      images: []
    },
    {
      name: 'Meter WP2-002',
      holderId: holders[3].id,
      waterPointId: waterPointIds[1],
      waterZoneId: waterZones[2].id, // Ramis
      measurementUnit: 'M3',
      images: [
        'https://example.com/meter4.jpg',
        'https://example.com/meter4_install.jpg',
        'https://example.com/meter4_reading.jpg'
      ]
    }
  ]

  await prisma.waterMeter.createMany({
    data: waterMeters
  })

  console.log(`Created ${waterMeters.length} water meters`)
}

const ISSUES = [
  {
    status: 'open',
    title: 'Fuga en tubería principal',
    description: null,
    reporterName: 'Olga',
    startAt: '2025-09-03T20:05:35.000Z',
    endAt: null
  },
  {
    status: 'open',
    title: 'Presión baja en zona residencial',
    description: null,
    reporterName: 'Rosabel',
    startAt: '2025-09-02T09:24:35.000Z',
    endAt: null
  },
  {
    status: 'closed',
    title: 'Avería en bomba de agua',
    description: 'La bomba principal presenta ruidos anómalos y baja presión',
    reporterName: 'Rosabel',
    startAt: '2025-08-25T18:45:00.000Z',
    endAt: '2025-09-03T10:00:00.000Z'
  }
]

async function seedIssues(waterZoneId: string) {
  await prisma.issue.deleteMany({})
  await prisma.issue.createMany({
    data: ISSUES.map((wp) => ({
      ...wp,
      waterZoneId
    }))
  })
}
