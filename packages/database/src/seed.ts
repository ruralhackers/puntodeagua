import bcrypt from 'bcrypt'
import { client } from './client'

const prisma = client

async function main() {
  await deleteAll()

  // Create multiple communities
  const { anceuCommunityId, ponteCaldelasCommunityId } = await seedPlanAndCommunities()

  // Create users for both communities
  await seedUsers(anceuCommunityId, ponteCaldelasCommunityId)

  // Create water infrastructure for both communities
  await seedWaterZones(anceuCommunityId, ponteCaldelasCommunityId)
  await seedAnalyses(anceuCommunityId, ponteCaldelasCommunityId)
  const anceuWaterPointIds = await seedWaterPoints(anceuCommunityId)
  const ponteCaldelasWaterPointIds = await seedWaterPoints(ponteCaldelasCommunityId)
  await seedHolders()
  await seedWaterMeters(anceuWaterPointIds, ponteCaldelasWaterPointIds)
  await seedIssues(anceuCommunityId, ponteCaldelasCommunityId)
  await seedWaterMeterReadings()
  await seedMaintenances(anceuCommunityId, ponteCaldelasCommunityId)
  await seedProviders(anceuCommunityId, ponteCaldelasCommunityId)
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
  await prisma.provider.deleteMany({})
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

async function seedWaterZones(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const waterZones = await prisma.waterZone.createMany({
    data: [
      // Anceu zones
      {
        name: 'Os Casas',
        communityId: anceuCommunityId
      },
      {
        name: 'Centro',
        communityId: anceuCommunityId
      },
      {
        name: 'Ramis',
        communityId: anceuCommunityId
      },
      // Ponte Caldelas zones
      {
        name: 'Zona Norte',
        communityId: ponteCaldelasCommunityId
      },
      {
        name: 'Zona Sur',
        communityId: ponteCaldelasCommunityId
      },
      {
        name: 'Centro Histórico',
        communityId: ponteCaldelasCommunityId
      }
    ]
  })

  return waterZones
}

async function seedAnalyses(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const anceuWaterZones = await prisma.waterZone.findMany({
    where: { communityId: anceuCommunityId }
  })
  const ponteCaldelasWaterZones = await prisma.waterZone.findMany({
    where: { communityId: ponteCaldelasCommunityId }
  })

  if (anceuWaterZones.length < 3 || ponteCaldelasWaterZones.length < 3) {
    console.log('Not enough water zones found, skipping analysis seed')
    return
  }

  const analyses = [
    // Anceu analyses
    {
      waterZoneId: anceuWaterZones[0]?.id || '',
      communityId: anceuCommunityId,
      analysisType: 'chlorine_ph',
      analyst: 'Rosa',
      analyzedAt: new Date(),
      ph: '7.2',
      chlorine: '0.5'
    },
    {
      waterZoneId: anceuWaterZones[1]?.id || '',
      communityId: anceuCommunityId,
      analysisType: 'chlorine_ph',
      analyst: 'Pepe',
      analyzedAt: new Date(),
      ph: '7.1',
      chlorine: '0.48'
    },
    {
      waterZoneId: anceuWaterZones[2]?.id || '',
      communityId: anceuCommunityId,
      analysisType: 'bacteriological',
      analyst: 'María',
      analyzedAt: new Date(),
      ph: '7.0',
      chlorine: '0.52'
    },
    // Ponte Caldelas analyses
    {
      waterZoneId: ponteCaldelasWaterZones[0]?.id || '',
      communityId: ponteCaldelasCommunityId,
      analysisType: 'chlorine_ph',
      analyst: 'Carlos',
      analyzedAt: new Date(),
      ph: '7.3',
      chlorine: '0.45'
    },
    {
      waterZoneId: ponteCaldelasWaterZones[1]?.id || '',
      communityId: ponteCaldelasCommunityId,
      analysisType: 'bacteriological',
      analyst: 'Ana',
      analyzedAt: new Date(),
      ph: '7.4',
      chlorine: '0.47'
    },
    {
      waterZoneId: ponteCaldelasWaterZones[2]?.id || '',
      communityId: ponteCaldelasCommunityId,
      analysisType: 'chlorine_ph',
      analyst: 'Luis',
      analyzedAt: new Date(),
      ph: '7.1',
      chlorine: '0.49'
    }
  ]

  await prisma.analysis.createMany({
    data: analyses
  })

  console.log(`Created ${analyses.length} analyses`)
}

async function seedMaintenances(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const anceuWaterZones = await prisma.waterZone.findMany({
    where: { communityId: anceuCommunityId }
  })
  const ponteCaldelasWaterZones = await prisma.waterZone.findMany({
    where: { communityId: ponteCaldelasCommunityId }
  })

  if (anceuWaterZones.length < 3 || ponteCaldelasWaterZones.length < 3) {
    console.log('Not enough water zones found, skipping maintenance seed')
    return
  }

  const maintenances = [
    // Anceu maintenances
    {
      waterZoneId: anceuWaterZones[0]?.id || '',
      communityId: anceuCommunityId,
      name: 'Limpieza de depósito Os Casas',
      scheduledDate: new Date(),
      responsible: 'Juan García'
    },
    {
      waterZoneId: anceuWaterZones[1]?.id || '',
      communityId: anceuCommunityId,
      name: 'Revisión de bomba Centro',
      scheduledDate: new Date(),
      responsible: 'María López'
    },
    {
      waterZoneId: anceuWaterZones[2]?.id || '',
      communityId: anceuCommunityId,
      name: 'Mantenimiento de válvulas Ramis',
      scheduledDate: new Date(),
      responsible: 'Carlos Rodríguez'
    },
    // Ponte Caldelas maintenances
    {
      waterZoneId: ponteCaldelasWaterZones[0]?.id || '',
      communityId: ponteCaldelasCommunityId,
      name: 'Inspección de tuberías Zona Norte',
      scheduledDate: new Date(),
      responsible: 'Pedro Martínez'
    },
    {
      waterZoneId: ponteCaldelasWaterZones[1]?.id || '',
      communityId: ponteCaldelasCommunityId,
      name: 'Limpieza de filtros Zona Sur',
      scheduledDate: new Date(),
      responsible: 'Isabel Fernández'
    },
    {
      waterZoneId: ponteCaldelasWaterZones[2]?.id || '',
      communityId: ponteCaldelasCommunityId,
      name: 'Revisión de contadores Centro Histórico',
      scheduledDate: new Date(),
      responsible: 'Antonio Silva'
    }
  ]

  await prisma.maintenance.createMany({
    data: maintenances
  })

  console.log(`Created ${maintenances.length} maintenances`)
}

async function seedProviders(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const providers = [
    // Anceu providers
    {
      communityId: anceuCommunityId,
      name: 'Fontanería García',
      phone: '986123456',
      description: 'Servicios de fontanería y reparaciones'
    },
    {
      communityId: anceuCommunityId,
      name: 'Bombas del Sur',
      phone: '986234567',
      description: 'Instalación y mantenimiento de bombas de agua'
    },
    {
      communityId: anceuCommunityId,
      name: 'Análisis Hídricos Galicia',
      phone: '986345678',
      description: 'Laboratorio de análisis de agua'
    },
    // Ponte Caldelas providers
    {
      communityId: ponteCaldelasCommunityId,
      name: 'Aqua Solutions',
      phone: '986456789',
      description: 'Soluciones integrales de agua'
    },
    {
      communityId: ponteCaldelasCommunityId,
      name: 'Mantenimientos del Río',
      phone: '986567890',
      description: 'Mantenimiento de infraestructura hídrica'
    },
    {
      communityId: ponteCaldelasCommunityId,
      name: 'Control Calidad Agua',
      phone: '986678901',
      description: 'Servicios de control de calidad del agua'
    }
  ]

  await prisma.provider.createMany({
    data: providers
  })

  console.log(`Created ${providers.length} providers`)
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

async function seedWaterMeters(anceuWaterPointIds: string[], ponteCaldelasWaterPointIds: string[]) {
  const holders = await prisma.holder.findMany()
  const anceuWaterPoint = await prisma.waterPoint.findUnique({
    where: { id: anceuWaterPointIds[0] }
  })
  const ponteCaldelasWaterPoint = await prisma.waterPoint.findUnique({
    where: { id: ponteCaldelasWaterPointIds[0] }
  })

  const anceuWaterZones = await prisma.waterZone.findMany({
    where: { communityId: anceuWaterPoint?.communityId }
  })
  const ponteCaldelasWaterZones = await prisma.waterZone.findMany({
    where: { communityId: ponteCaldelasWaterPoint?.communityId }
  })

  const waterMeters = [
    // Anceu water meters
    {
      name: 'Meter WP1-001',
      holderId: holders[0]?.id || '',
      waterPointId: anceuWaterPointIds[0] || '',
      waterZoneId: anceuWaterZones[0]?.id || '', // Os Casas
      measurementUnit: 'L',
      images: ['https://example.com/meter1.jpg', 'https://example.com/meter1_detail.jpg']
    },
    {
      name: 'Meter WP1-002',
      holderId: holders[1]?.id || '',
      waterPointId: anceuWaterPointIds[0] || '',
      waterZoneId: anceuWaterZones[1]?.id || '', // Centro
      measurementUnit: 'M3',
      images: ['https://example.com/meter2.jpg']
    },
    {
      name: 'Meter WP2-001',
      holderId: holders[2]?.id || '',
      waterPointId: anceuWaterPointIds[1] || '',
      waterZoneId: anceuWaterZones[1]?.id || '', // Centro
      measurementUnit: 'L',
      images: []
    },
    {
      name: 'Meter WP2-002',
      holderId: holders[3]?.id || '',
      waterPointId: anceuWaterPointIds[1] || '',
      waterZoneId: anceuWaterZones[2]?.id || '', // Ramis
      measurementUnit: 'M3',
      images: [
        'https://example.com/meter4.jpg',
        'https://example.com/meter4_install.jpg',
        'https://example.com/meter4_reading.jpg'
      ]
    },
    // Ponte Caldelas water meters
    {
      name: 'Meter PC1-001',
      holderId: holders[0]?.id || '',
      waterPointId: ponteCaldelasWaterPointIds[0] || '',
      waterZoneId: ponteCaldelasWaterZones[0]?.id || '', // Zona Norte
      measurementUnit: 'L',
      images: ['https://example.com/meter_pc1.jpg']
    },
    {
      name: 'Meter PC1-002',
      holderId: holders[1]?.id || '',
      waterPointId: ponteCaldelasWaterPointIds[0] || '',
      waterZoneId: ponteCaldelasWaterZones[1]?.id || '', // Zona Sur
      measurementUnit: 'M3',
      images: ['https://example.com/meter_pc2.jpg']
    },
    {
      name: 'Meter PC2-001',
      holderId: holders[2]?.id || '',
      waterPointId: ponteCaldelasWaterPointIds[1] || '',
      waterZoneId: ponteCaldelasWaterZones[2]?.id || '', // Centro Histórico
      measurementUnit: 'L',
      images: []
    }
  ]

  await prisma.waterMeter.createMany({
    data: waterMeters
  })

  console.log(`Created ${waterMeters.length} water meters`)
}

async function seedIssues(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const anceuWaterZones = await prisma.waterZone.findMany({
    where: { communityId: anceuCommunityId }
  })
  const ponteCaldelasWaterZones = await prisma.waterZone.findMany({
    where: { communityId: ponteCaldelasCommunityId }
  })

  if (anceuWaterZones.length < 3 || ponteCaldelasWaterZones.length < 3) {
    console.log('Not enough water zones found, skipping issues seed')
    return
  }

  const issues = [
    // Anceu issues
    {
      status: 'open',
      title: 'Fuga en tubería principal',
      description: null,
      reporterName: 'Olga',
      startAt: '2025-09-03T20:05:35.000Z',
      endAt: null,
      waterZoneId: anceuWaterZones[0]?.id || '',
      communityId: anceuCommunityId
    },
    {
      status: 'open',
      title: 'Presión baja en zona residencial',
      description: null,
      reporterName: 'Rosabel',
      startAt: '2025-09-02T09:24:35.000Z',
      endAt: null,
      waterZoneId: anceuWaterZones[0]?.id || '',
      communityId: anceuCommunityId
    },
    {
      status: 'open',
      title: 'Contador bloqueado en sector Ramis',
      description: 'El contador principal del sector Ramis no registra consumo desde hace 3 días',
      reporterName: 'Miguel',
      startAt: '2025-09-04T14:30:00.000Z',
      endAt: null,
      waterZoneId: anceuWaterZones[2]?.id || '',
      communityId: anceuCommunityId
    },
    {
      status: 'closed',
      title: 'Avería en bomba de agua',
      description: 'La bomba principal presenta ruidos anómalos y baja presión',
      reporterName: 'Rosabel',
      startAt: '2025-08-25T18:45:00.000Z',
      endAt: '2025-09-03T10:00:00.000Z',
      waterZoneId: anceuWaterZones[1]?.id || '',
      communityId: anceuCommunityId
    },
    // Ponte Caldelas issues
    {
      status: 'open',
      title: 'Filtro obstruido en Zona Norte',
      description:
        'El filtro principal de la Zona Norte presenta obstrucción y reduce el flujo de agua',
      reporterName: 'Carmen',
      startAt: '2025-09-05T08:15:00.000Z',
      endAt: null,
      waterZoneId: ponteCaldelasWaterZones[0]?.id || '',
      communityId: ponteCaldelasCommunityId
    },
    {
      status: 'open',
      title: 'Válvula defectuosa en Centro Histórico',
      description: null,
      reporterName: 'Roberto',
      startAt: '2025-09-04T16:20:00.000Z',
      endAt: null,
      waterZoneId: ponteCaldelasWaterZones[2]?.id || '',
      communityId: ponteCaldelasCommunityId
    },
    {
      status: 'closed',
      title: 'Reparación de tubería Zona Sur',
      description: 'Tubería principal dañada por obras en la calle',
      reporterName: 'Elena',
      startAt: '2025-08-28T10:00:00.000Z',
      endAt: '2025-09-01T14:30:00.000Z',
      waterZoneId: ponteCaldelasWaterZones[1]?.id || '',
      communityId: ponteCaldelasCommunityId
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
