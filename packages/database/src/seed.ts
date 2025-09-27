import { saltAndHashPassword } from '@pda/common/domain'
import { client } from './client'

const prisma = client

async function main() {
  await deleteAll()

  // Create multiple communities
  const { anceuCommunityId, ponteCaldelasCommunityId } = await seedPlanAndCommunities()

  // Create water deposits for both communities
  await seedWaterDeposits(anceuCommunityId, ponteCaldelasCommunityId)

  // Create community zones for Anceu
  const zoneIds = await seedCommunityZones(anceuCommunityId)

  // Create water points for Anceu zones
  const waterPointIds = await seedWaterPoints(zoneIds)

  // Create water accounts
  const waterAccountIds = await seedWaterAccounts()

  // Create water meters (connecting water accounts to water points)
  const waterMeterIds = await seedWaterMeters(waterPointIds, waterAccountIds)

  // Create water meter readings (2 readings per meter)
  await seedWaterMeterReadings(waterMeterIds)

  // // Create users for both communities
  await seedUsers(anceuCommunityId, ponteCaldelasCommunityId)

  // Create analyses for both communities
  await seedAnalyses(anceuCommunityId, ponteCaldelasCommunityId)
  // await seedHolders()
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
  await prisma.waterMeterReading.deleteMany({})
  await prisma.waterMeter.deleteMany({})
  await prisma.waterAccount.deleteMany({})
  await prisma.waterPoint.deleteMany({})
  await prisma.waterDeposit.deleteMany({})
  await prisma.analysis.deleteMany({}) // Delete analyses before communities
  await prisma.communityZone.deleteMany({})
  await prisma.community.deleteMany({})
  // await prisma.plan.deleteMany({})
  // await prisma.file.deleteMany({})
  // await prisma.waterZone.deleteMany({})
  // await prisma.issue.deleteMany({})
  // await prisma.holder.deleteMany({})
  // await prisma.maintenance.deleteMany({})
  // await prisma.provider.deleteMany({})
}

async function seedPlanAndCommunities() {
  const anceuCommunity = await prisma.community.create({
    data: {
      name: 'Anceu',
      waterLimitRule: {
        type: 'PERSON_BASED',
        value: 150
      }
    }
  })

  const ponteCaldelasCommunity = await prisma.community.create({
    data: {
      name: 'Ponte Caldelas',
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

async function seedWaterDeposits(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const waterDeposits = [
    // Anceu community deposits
    {
      name: 'Depósito Principal Anceu',
      location: 'Zona alta de Anceu, junto al depósito de agua potable',
      communityId: anceuCommunityId,
      notes:
        'Depósito principal de almacenamiento de agua para la comunidad de Anceu. Capacidad de 50,000 litros.'
    },
    {
      name: 'Depósito de Reserva Anceu',
      location: 'Zona norte, cerca del campo de fútbol',
      communityId: anceuCommunityId,
      notes: 'Depósito de reserva para situaciones de emergencia. Capacidad de 25,000 litros.'
    },
    {
      name: 'Depósito O Ramis',
      location: 'Centro de O Ramis, junto a la fuente principal',
      communityId: anceuCommunityId,
      notes: 'Depósito específico para la zona de O Ramis. Capacidad de 30,000 litros.'
    },
    {
      name: 'Depósito Os Casas',
      location: 'Zona sur de Os Casas, cerca del lavadero',
      communityId: anceuCommunityId,
      notes: 'Depósito para la zona de Os Casas. Capacidad de 20,000 litros.'
    },

    // Ponte Caldelas community deposits
    {
      name: 'Depósito Principal Ponte Caldelas',
      location: 'Centro de Ponte Caldelas, zona industrial',
      communityId: ponteCaldelasCommunityId,
      notes: 'Depósito principal de almacenamiento para Ponte Caldelas. Capacidad de 75,000 litros.'
    },
    {
      name: 'Depósito de Emergencia Ponte Caldelas',
      location: 'Zona residencial, cerca del centro de salud',
      communityId: ponteCaldelasCommunityId,
      notes: 'Depósito de emergencia para situaciones críticas. Capacidad de 40,000 litros.'
    }
  ]

  await prisma.waterDeposit.createMany({
    data: waterDeposits
  })

  console.log('Created water deposits:')
  console.log('- Anceu community: 4 deposits (Principal, Reserva, O Ramis, Os Casas)')
  console.log('- Ponte Caldelas community: 2 deposits (Principal, Emergencia)')
  console.log('- Total: 6 water deposits')
}

async function seedUsers(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  const users = [
    {
      email: 'superadmin@puntodeagua.com',
      name: 'Super Admin',
      passwordHash: await saltAndHashPassword('superadmin123'),
      roles: ['ADMIN'],
      communityId: null // Super admin doesn't belong to a specific community
    },
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

async function seedCommunityZones(anceuCommunityId: string) {
  const anceuZone = await prisma.communityZone.create({
    data: {
      name: 'Anceu',
      communityId: anceuCommunityId,
      notes: 'Main zone of Anceu community'
    }
  })

  const oRamisZone = await prisma.communityZone.create({
    data: {
      name: 'O Ramis',
      communityId: anceuCommunityId,
      notes: 'O Ramis zone in Anceu community'
    }
  })

  const osCasasZone = await prisma.communityZone.create({
    data: {
      name: 'Os Casas',
      communityId: anceuCommunityId,
      notes: 'Os Casas zone in Anceu community'
    }
  })

  console.log('Created community zones for Anceu:')
  console.log('- Anceu - O Ramis - Os Casas')

  return {
    anceuZoneId: anceuZone.id,
    oRamisZoneId: oRamisZone.id,
    osCasasZoneId: osCasasZone.id
  }
}

async function seedWaterPoints(zoneIds: {
  anceuZoneId: string
  oRamisZoneId: string
  osCasasZoneId: string
}) {
  const waterPointsData = [
    // Anceu zone water points
    {
      name: 'Punto Principal Anceu',
      location: 'Centro de Anceu, junto a la iglesia',
      communityZoneId: zoneIds.anceuZoneId,
      fixedPopulation: 25,
      floatingPopulation: 5,
      cadastralReference: 'ANCEU-001',
      notes: 'Punto principal de distribución de agua en el centro de Anceu'
    },
    {
      name: 'Fuente de Anceu',
      location: 'Fuente tradicional en la plaza',
      communityZoneId: zoneIds.anceuZoneId,
      fixedPopulation: 15,
      floatingPopulation: 3,
      cadastralReference: 'ANCEU-002',
      notes: 'Fuente histórica restaurada para uso comunitario'
    },
    {
      name: 'Depósito Anceu Norte',
      location: 'Zona norte, cerca del campo de fútbol',
      communityZoneId: zoneIds.anceuZoneId,
      fixedPopulation: 20,
      floatingPopulation: 2,
      cadastralReference: 'ANCEU-003',
      notes: 'Depósito de agua para la zona norte de Anceu'
    },

    // O Ramis zone water points
    {
      name: 'Punto O Ramis Central',
      location: 'Centro de O Ramis',
      communityZoneId: zoneIds.oRamisZoneId,
      fixedPopulation: 18,
      floatingPopulation: 4,
      cadastralReference: 'ORAMIS-001',
      notes: 'Punto principal de distribución en O Ramis'
    },
    {
      name: 'Fuente O Ramis',
      location: 'Fuente en la entrada del pueblo',
      communityZoneId: zoneIds.oRamisZoneId,
      fixedPopulation: 12,
      floatingPopulation: 2,
      cadastralReference: 'ORAMIS-002',
      notes: 'Fuente comunitaria en la entrada de O Ramis'
    },

    // Os Casas zone water points
    {
      name: 'Punto Os Casas Principal',
      location: 'Centro de Os Casas',
      communityZoneId: zoneIds.osCasasZoneId,
      fixedPopulation: 22,
      floatingPopulation: 6,
      cadastralReference: 'OSCASAS-001',
      notes: 'Punto principal de distribución en Os Casas'
    },
    {
      name: 'Depósito Os Casas Sur',
      location: 'Zona sur de Os Casas',
      communityZoneId: zoneIds.osCasasZoneId,
      fixedPopulation: 16,
      floatingPopulation: 3,
      cadastralReference: 'OSCASAS-002',
      notes: 'Depósito para la zona sur de Os Casas'
    },
    {
      name: 'Fuente Os Casas',
      location: 'Fuente junto al lavadero',
      communityZoneId: zoneIds.osCasasZoneId,
      fixedPopulation: 14,
      floatingPopulation: 2,
      cadastralReference: 'OSCASAS-003',
      notes: 'Fuente tradicional junto al lavadero comunitario'
    }
  ]

  await prisma.waterPoint.createMany({
    data: waterPointsData
  })

  console.log('Created water points:')
  console.log('- Anceu zone: 3 water points')
  console.log('- O Ramis zone: 2 water points')
  console.log('- Os Casas zone: 3 water points')
  console.log('- Total: 8 water points')

  // Return water point IDs for water meter creation
  const createdWaterPoints = await prisma.waterPoint.findMany({
    where: {
      communityZoneId: {
        in: [zoneIds.anceuZoneId, zoneIds.oRamisZoneId, zoneIds.osCasasZoneId]
      }
    }
  })

  return createdWaterPoints.map((wp) => wp.id)
}

async function seedWaterAccounts() {
  const waterAccounts = [
    {
      name: 'Familia García',
      nationalId: '12345678A',
      notes: 'Familia residente en Anceu'
    },
    {
      name: 'Familia López',
      nationalId: '87654321B',
      notes: 'Familia residente en O Ramis'
    },
    {
      name: 'Familia Martínez',
      nationalId: '11223344C',
      notes: 'Familia residente en Os Casas'
    },
    {
      name: 'Familia Rodríguez',
      nationalId: '44332211D',
      notes: 'Segunda familia en Anceu'
    },
    {
      name: 'Familia Fernández',
      nationalId: '55667788E',
      notes: 'Familia en O Ramis'
    },
    {
      name: 'Familia González',
      nationalId: '99887766F',
      notes: 'Segunda familia en Os Casas'
    },
    {
      name: 'Familia Pérez',
      nationalId: '13579246G',
      notes: 'Tercera familia en Anceu'
    },
    {
      name: 'Familia Sánchez',
      nationalId: '24681357H',
      notes: 'Tercera familia en Os Casas'
    }
  ]

  await prisma.waterAccount.createMany({
    data: waterAccounts
  })

  console.log('Created water accounts:')
  console.log('- Total: 8 water accounts')

  // Return water account IDs for water meter creation
  const accounts = await prisma.waterAccount.findMany()
  return accounts.map((account) => account.id)
}

async function seedWaterMeters(waterPointIds: string[], waterAccountIds: string[]) {
  // Get water points with their zone information for better naming
  const waterPoints = await prisma.waterPoint.findMany({
    where: { id: { in: waterPointIds } },
    include: { communityZone: true }
  })

  const waterMeters = waterPointIds.map((waterPointId, index) => {
    const waterPoint = waterPoints.find((wp) => wp.id === waterPointId)
    const waterAccountId = waterAccountIds[index % waterAccountIds.length] // Distribute accounts across water points

    // Ensure waterAccountId is defined
    if (!waterAccountId) {
      throw new Error(`No water account found for index ${index}`)
    }

    // Determine measurement unit based on zone (some zones use L, others M3)
    const measurementUnit = waterPoint?.communityZone.name === 'Anceu' ? 'L' : 'M3'

    // Generate realistic initial readings
    const initialReading =
      measurementUnit === 'L'
        ? Math.floor(Math.random() * 50000) + 10000
        : // 10k-60k liters
          Math.floor(Math.random() * 50) + 10 // 10-60 cubic meters

    return {
      name: `Contador ${waterPoint?.name || `Punto ${index + 1}`}`,
      waterAccountId,
      waterPointId,
      measurementUnit,
      lastReadingNormalizedValue:
        measurementUnit === 'L' ? Math.floor(initialReading / 1000) : initialReading,
      lastReadingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
      lastReadingExcessConsumption: Math.random() > 0.7 // 30% chance of excess consumption
    }
  })

  await prisma.waterMeter.createMany({
    data: waterMeters
  })

  console.log('Created water meters:')
  console.log('- Total: 8 water meters')
  console.log('- Measurement units: Mix of L and M3')
  console.log('- Initial readings: Realistic values with some excess consumption')

  // Return water meter IDs for potential future use
  const meters = await prisma.waterMeter.findMany()
  return meters.map((meter) => meter.id)
}

async function seedWaterMeterReadings(waterMeterIds: string[]) {
  // Get all water meters with their details for realistic reading generation
  const waterMeters = await prisma.waterMeter.findMany({
    where: { id: { in: waterMeterIds } },
    include: { waterPoint: { include: { communityZone: true } } }
  })

  const waterMeterReadings = []

  for (const waterMeter of waterMeters) {
    // Generate 2 readings per water meter
    for (let i = 0; i < 2; i++) {
      // First reading is older (30-60 days ago), second is more recent (1-15 days ago)
      const daysAgo =
        i === 0
          ? Math.floor(Math.random() * 30) + 30 // 30-60 days ago
          : Math.floor(Math.random() * 14) + 1 // 1-15 days ago

      const readingDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      // Generate realistic reading values based on measurement unit
      let reading: number
      let normalizedReading: number

      if (waterMeter.measurementUnit === 'L') {
        // For L: generate readings between 5000-80000 liters
        reading = Math.floor(Math.random() * 75000) + 5000
        normalizedReading = reading // Already in Liters, no conversion needed
      } else {
        // For M3: generate readings between 5-80 M3
        reading = Math.floor(Math.random() * 75) + 5
        normalizedReading = Math.floor(reading * 1000) // Convert M3 to Liters (normalized)
      }

      // Add some consumption between readings (second reading should be higher)
      if (i === 1) {
        const consumption =
          waterMeter.measurementUnit === 'L'
            ? Math.floor(Math.random() * 10000) + 2000 // 2k-12k liters consumption
            : Math.floor(Math.random() * 10) + 2 // 2-12 M3 consumption (will be converted to liters)

        reading += consumption
        normalizedReading =
          waterMeter.measurementUnit === 'L' ? reading : Math.floor(reading * 1000) // Keep in Liters or convert M3 to Liters
      }

      waterMeterReadings.push({
        waterMeterId: waterMeter.id,
        reading: reading,
        normalizedReading: normalizedReading,
        readingDate: readingDate,
        notes:
          i === 0
            ? `Lectura inicial del contador ${waterMeter.name}`
            : `Lectura reciente del contador ${waterMeter.name}`
      })
    }
  }

  await prisma.waterMeterReading.createMany({
    data: waterMeterReadings
  })

  console.log('Created water meter readings:')
  console.log(`- Total: ${waterMeterReadings.length} readings`)
  console.log('- 2 readings per water meter (8 meters × 2 = 16 readings)')
  console.log('- Reading dates: Mix of recent and historical readings')
  console.log('- Realistic consumption patterns between readings')
}

async function seedAnalyses(anceuCommunityId: string, ponteCaldelasCommunityId: string) {
  console.log('Creating water analyses...')

  // Get water zones and deposits for both communities
  const anceuZones = await prisma.communityZone.findMany({
    where: { communityId: anceuCommunityId }
  })

  const anceuDeposits = await prisma.waterDeposit.findMany({
    where: { communityId: anceuCommunityId }
  })

  const ponteCaldelasDeposits = await prisma.waterDeposit.findMany({
    where: { communityId: ponteCaldelasCommunityId }
  })

  const analyses = []

  // Create analyses for Anceu community
  const anceuAnalyses = [
    {
      communityId: anceuCommunityId,
      waterZoneId: anceuZones[0]?.id, // First zone
      analysisType: 'complete',
      analyst: 'Dr. María González',
      analyzedAt: new Date('2024-01-15'),
      ph: '7.2',
      chlorine: '0.8',
      turbidity: '1.2',
      description:
        'Análisis completo de calidad del agua en la zona principal. Todos los parámetros dentro de los rangos normales.'
    },
    {
      communityId: anceuCommunityId,
      waterZoneId: anceuZones[1]?.id, // Second zone
      analysisType: 'chlorine_ph',
      analyst: 'Ing. Carlos Ruiz',
      analyzedAt: new Date('2024-01-20'),
      ph: '6.8',
      chlorine: '0.6',
      description: 'Control rutinario de cloro y pH en zona residencial.'
    },
    {
      communityId: anceuCommunityId,
      waterDepositId: anceuDeposits[0]?.id, // First deposit
      analysisType: 'turbidity',
      analyst: 'Téc. Ana Martínez',
      analyzedAt: new Date('2024-01-25'),
      turbidity: '0.8',
      description: 'Medición de turbidez en depósito principal. Agua cristalina.'
    },
    {
      communityId: anceuCommunityId,
      analysisType: 'hardness',
      analyst: 'Dr. Pedro López',
      analyzedAt: new Date('2024-02-01'),
      ph: '7.5',
      description: 'Análisis de dureza del agua en la red general de la comunidad.'
    },
    {
      communityId: anceuCommunityId,
      waterZoneId: anceuZones[0]?.id,
      analysisType: 'complete',
      analyst: 'Dr. María González',
      analyzedAt: new Date('2024-02-10'),
      ph: '7.1',
      chlorine: '0.9',
      turbidity: '1.0',
      description: 'Seguimiento mensual de calidad del agua. Parámetros estables.'
    }
  ]

  // Create analyses for Ponte Caldelas community
  const ponteCaldelasAnalyses = [
    {
      communityId: ponteCaldelasCommunityId,
      waterDepositId: ponteCaldelasDeposits[0]?.id,
      analysisType: 'complete',
      analyst: 'Dr. Laura Fernández',
      analyzedAt: new Date('2024-01-18'),
      ph: '7.3',
      chlorine: '0.7',
      turbidity: '1.1',
      description: 'Análisis completo en depósito principal de Ponte Caldelas.'
    },
    {
      communityId: ponteCaldelasCommunityId,
      analysisType: 'chlorine_ph',
      analyst: 'Ing. Roberto Silva',
      analyzedAt: new Date('2024-01-28'),
      ph: '7.0',
      chlorine: '0.8',
      description: 'Control de desinfección en la red de distribución.'
    },
    {
      communityId: ponteCaldelasCommunityId,
      waterDepositId: ponteCaldelasDeposits[1]?.id,
      analysisType: 'turbidity',
      analyst: 'Téc. Carmen Vázquez',
      analyzedAt: new Date('2024-02-05'),
      turbidity: '0.9',
      description: 'Medición de turbidez en depósito secundario.'
    }
  ]

  // Combine all analyses
  analyses.push(...anceuAnalyses, ...ponteCaldelasAnalyses)

  // Create analyses in database
  await prisma.analysis.createMany({
    data: analyses
  })

  console.log('Created water analyses:')
  console.log(`- Total: ${analyses.length} analyses`)
  console.log(`- Anceu: ${anceuAnalyses.length} analyses`)
  console.log(`- Ponte Caldelas: ${ponteCaldelasAnalyses.length} analyses`)
  console.log('- Analysis types: complete, chlorine_ph, turbidity, hardness')
  console.log('- Date range: January-February 2024')
  console.log('- Realistic water quality parameters')
}
