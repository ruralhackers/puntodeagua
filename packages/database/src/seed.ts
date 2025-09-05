import bcrypt from 'bcrypt'
import { client } from './client'

const prisma = client

async function main() {
  await deleteAll()

  // Create multiple communities
  const { anceuCommunityId, ponteCaldelasCommunityId } = await seedPlanAndCommunities()

  // Create users for both communities
  await seedUsers(anceuCommunityId, ponteCaldelasCommunityId)

  // Create water infrastructure for Anceu community
  await seedWaterZones(anceuCommunityId)
  await seedAnalyses()
  const waterPointIds = await seedWaterPoints(anceuCommunityId)
  await seedHolders()
  await seedWaterMeters(waterPointIds)
  await seedIssues()
  await seedWaterMeterReadings()
  await seedMaintenances()
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
  await prisma.file.deleteMany({})
  await prisma.waterMeterReading.deleteMany({})
  await prisma.waterMeter.deleteMany({})
  await prisma.waterPoint.deleteMany({})
  await prisma.waterZone.deleteMany({})
  await prisma.issue.deleteMany({})
  await prisma.holder.deleteMany({})
  await prisma.analysis.deleteMany({})
  await prisma.maintenance.deleteMany({})
  await prisma.community.deleteMany({})
  await prisma.plan.deleteMany({})
}

async function seedUsers(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const saltRounds = 10

  const users = [
    {
      email: 'superadmin@puntodeagua.com',
      name: 'Super Admin',
      password: await bcrypt.hash('superadmin123', saltRounds),
      roles: ['SUPER_ADMIN'],
      communityId: null // Super admin doesn't belong to a specific community
    },
    // Anceu community users
    {
      email: 'admin@anceu.com',
      name: 'Admin Anceu',
      password: await bcrypt.hash('admin123', saltRounds),
      roles: ['COMMUNITY_ADMIN'],
      communityId: anceuCommunityId
    },
    {
      email: 'manager@anceu.com',
      name: 'Manager Anceu',
      password: await bcrypt.hash('manager123', saltRounds),
      roles: ['MANAGER'],
      communityId: anceuCommunityId
    },
    {
      email: 'user1@anceu.com',
      name: 'Usuario 1 Anceu',
      password: await bcrypt.hash('user123', saltRounds),
      roles: ['COMMUNITY_ADMIN'],
      communityId: anceuCommunityId
    },
    {
      email: 'user2@anceu.com',
      name: 'Usuario 2 Anceu',
      password: await bcrypt.hash('user123', saltRounds),
      roles: ['COMMUNITY_ADMIN'],
      communityId: anceuCommunityId
    },
    // Ponte Caldelas community users
    {
      email: 'admin@pontecaldelas.com',
      name: 'Admin Ponte Caldelas',
      password: await bcrypt.hash('admin123', saltRounds),
      roles: ['COMMUNITY_ADMIN'],
      communityId: ponteCaldelasCommunityId
    },
    {
      email: 'user@pontecaldelas.com',
      name: 'Usuario Ponte Caldelas',
      password: await bcrypt.hash('user123', saltRounds),
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
      dailyWaterLimitLitersPerPerson: 180
    }
  })

  const ponteCaldelasCommunity = await prisma.community.create({
    data: {
      name: 'Ponte Caldelas',
      planId: plan.id,
      dailyWaterLimitLitersPerPerson: 220
    }
  })

  return {
    anceuCommunityId: anceuCommunity.id,
    ponteCaldelasCommunityId: ponteCaldelasCommunity.id
  }
}

const WATER_POINTS = [
  {
    name: 'Water Point 1',
    location: '42.359987,-8.4669443',
    description: 'This is a description for Water Point 1',
    fixedPopulation: 4,
    floatingPopulation: 2
  },
  {
    name: 'Water Point 2',
    location: '42.359987,-8.4669443',
    description: 'This is a description for Water Point 2',
    fixedPopulation: 6,
    floatingPopulation: 8
  }
]

async function seedWaterPoints(communityId: string) {
  const waterPoints = await prisma.waterPoint.createManyAndReturn({
    data: WATER_POINTS.map((wp) => ({
      ...wp,
      communityId
    }))
  })
  return waterPoints.map((wp) => wp.id)
}

async function seedWaterZones(communityId: string) {
  const waterZones = await prisma.waterZone.createMany({
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

  return waterZones
}

async function seedAnalyses() {
  const waterZone = await prisma.waterZone.findFirst()

  await prisma.analysis.createMany({
    data: [
      {
        waterZoneId: waterZone!.id,
        analysisType: 'chlorine_ph',
        analyst: 'Rosa',
        analyzedAt: new Date(),
        ph: '7.2',
        chlorine: '0.5'
      },
      {
        waterZoneId: waterZone!.id,
        analysisType: 'chlorine_ph',
        analyst: 'Pepe',
        analyzedAt: new Date(),
        ph: '7.1',
        chlorine: '0.48'
      }
    ]
  })
}

async function seedMaintenances() {
  const waterZone = await prisma.waterZone.findFirst()

  if (!waterZone) {
    console.log('No water zone found, skipping maintenance seed')
    return
  }

  await prisma.maintenance.createMany({
    data: [
      {
        waterZoneId: waterZone.id,
        name: 'Maintenance 1',
        scheduledDate: new Date(),
        responsible: 'Juan García'
      },
      {
        waterZoneId: waterZone.id,
        name: 'Maintenance 2',
        scheduledDate: new Date(),
        responsible: 'María López'
      },
      {
        waterZoneId: waterZone.id,
        name: 'Maintenance 3',
        scheduledDate: new Date(),
        responsible: 'Carlos Rodríguez'
      }
    ]
  })
}

const HOLDERS = [
  {
    name: 'Juan García',
    nationalId: '12345678A',
    cadastralReference: 'C123456789',
    description: 'Propietario de la vivienda'
  },
  {
    name: 'María López',
    nationalId: '23456789B',
    cadastralReference: 'C234567890',
    description: 'Propietaria de la vivienda'
  },
  {
    name: 'Carlos Rodríguez',
    nationalId: '34567890C',
    cadastralReference: 'C345678901',
    description: 'Vive en Brasil, contacta con su prima Sita'
  },
  {
    name: 'Ana Martínez',
    nationalId: '45678901D',
    cadastralReference: 'C456789012',
    description: 'Propietaria de la vivienda'
  }
]

async function seedHolders() {
  await prisma.holder.createMany({
    data: HOLDERS
  })
}

async function seedWaterMeters(waterPointIds: string[]) {
  const holders = await prisma.holder.findMany()
  const waterZones = await prisma.waterZone.findMany()

  const waterMeters = [
    {
      name: 'Meter WP1-001',
      holderId: holders[0]!.id,
      waterPointId: waterPointIds[0]!,
      waterZoneId: waterZones[0]!.id, // Os Casas
      measurementUnit: 'L',
      images: ['https://example.com/meter1.jpg', 'https://example.com/meter1_detail.jpg']
    },
    {
      name: 'Meter WP1-002',
      holderId: holders[1]!.id,
      waterPointId: waterPointIds[0]!,
      waterZoneId: waterZones[1]!.id, // Centro
      measurementUnit: 'M3',
      images: ['https://example.com/meter2.jpg']
    },
    {
      name: 'Meter WP2-001',
      holderId: holders[2]!.id,
      waterPointId: waterPointIds[1]!,
      waterZoneId: waterZones[1]!.id, // Centro
      measurementUnit: 'L',
      images: []
    },
    {
      name: 'Meter WP2-002',
      holderId: holders[3]!.id,
      waterPointId: waterPointIds[1]!,
      waterZoneId: waterZones[2]!.id, // Ramis
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

async function seedIssues() {
  const waterZones = await prisma.waterZone.findMany()

  const issues = [
    {
      status: 'open',
      title: 'Fuga en tubería principal',
      description: null,
      reporterName: 'Olga',
      startAt: '2025-09-03T20:05:35.000Z',
      endAt: null,
      waterZoneId: waterZones[0]!.id
    },
    {
      status: 'open',
      title: 'Presión baja en zona residencial',
      description: null,
      reporterName: 'Rosabel',
      startAt: '2025-09-02T09:24:35.000Z',
      endAt: null,
      waterZoneId: waterZones[0]!.id
    },
    {
      status: 'open',
      title: 'Contador bloqueado en sector Ramis',
      description: 'El contador principal del sector Ramis no registra consumo desde hace 3 días',
      reporterName: 'Miguel',
      startAt: '2025-09-04T14:30:00.000Z',
      endAt: null,
      waterZoneId: waterZones[2]!.id
    },
    {
      status: 'closed',
      title: 'Avería en bomba de agua',
      description: 'La bomba principal presenta ruidos anómalos y baja presión',
      reporterName: 'Rosabel',
      startAt: '2025-08-25T18:45:00.000Z',
      endAt: '2025-09-03T10:00:00.000Z',
      waterZoneId: waterZones[1]!.id
    }
  ]

  await prisma.issue.createMany({
    data: issues
  })

  console.log(`Created ${issues.length} issues`)
}

async function seedWaterMeterReadings() {
  const waterMeters = await prisma.waterMeter.findMany()

  if (waterMeters.length === 0) {
    console.log('No water meters found, skipping water meter readings seed')
    return
  }

  // Create readings for the last 6 months with different patterns
  const readings = []
  const now = new Date()

  for (const meter of waterMeters) {
    // Generate 6 months of readings (one per month)
    for (let i = 5; i >= 0; i--) {
      const readingDate = new Date(now.getFullYear(), now.getMonth() - i, 1) // 15th of each month

      // Generate realistic reading values based on measurement unit
      let reading: string
      let normalizedReading: string

      if (meter.measurementUnit === 'L') {
        // Liters: generate values between 1000-5000 L
        const litersValue = Math.floor(Math.random() * 4000) + 1000
        reading = litersValue.toString()
        // Normalize to m³ (divide by 1000)
        normalizedReading = (litersValue / 1000).toFixed(3)
      } else {
        // M³: generate values between 1-5 m³
        const m3Value = (Math.random() * 4 + 1).toFixed(3)
        reading = m3Value
        // Normalize to m³ (same value)
        normalizedReading = m3Value
      }

      readings.push({
        waterMeterId: meter.id,
        reading,
        normalizedReading,
        readingDate,
        notes:
          i === 0
            ? 'Última lectura del mes'
            : `Lectura mensual - ${readingDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
      })
    }
  }

  await prisma.waterMeterReading.createMany({
    data: readings
  })

  console.log(`Created ${readings.length} water meter readings`)
}
