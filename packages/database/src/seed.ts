import bcrypt from 'bcrypt'
import { Id } from 'core'
import { client } from './client'

const prisma = client

async function main() {
  await cleanDatabase() // ← NUEVO: Limpiar todo primero
  await seedUsers()
  const communityId = await seedPlanAndCommunity()
  await seedWaterZones(communityId)
  await seedWaterPoints(communityId)
  await seedHolders()
  await seedWaterMeters(communityId)
  await seedWaterMeterReadings()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function cleanDatabase() {
  // ← NUEVA: Función para limpiar toda la base de datos SIN transacciones
  console.log('🧹 Cleaning database...')

  try {
    // Orden: eliminar desde las hojas hacia la raíz (sin dependencias → con dependencias)
    await prisma.fileAttachment.deleteMany({})
    await prisma.waterMeterReading.deleteMany({})
    await prisma.waterMeter.deleteMany({})
    await prisma.waterPoint.deleteMany({})
    await prisma.waterZone.deleteMany({})
    await prisma.holder.deleteMany({})
    await prisma.community.deleteMany({})
    await prisma.plan.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('✅ Database cleaned successfully')
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    throw error
  }
}

async function seedUsers() {
  // ← CORREGIR: NO eliminar aquí, solo crear
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

  console.log('✅ Created users:')
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

  console.log('✅ Created community:', community.name)
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
  // ← CORREGIR: NO eliminar aquí, solo crear
  await prisma.waterPoint.createMany({
    data: WATER_POINTS.map((wp) => ({
      ...wp,
      communityId
    }))
  })

  console.log('🚰 Created water points')
}

async function seedWaterZones(communityId: string) {
  // ← CORREGIR: NO eliminar aquí, solo crear
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

  console.log('🌊 Created water zones')
}

async function seedHolders() {
  // ← CORREGIR: NO eliminar aquí, solo crear
  await prisma.holder.createMany({
    data: [{ name: 'Holder 1' }, { name: 'Holder 2' }]
  })

  console.log('✅ Created holders')
}

async function seedWaterMeters(communityId: string) {
  // ← CORREGIR: NO eliminar aquí, solo crear
  const waterPoints = await prisma.waterPoint.findMany()
  const holders = await prisma.holder.findMany()

  const waterMeters = []
  for (let i = 0; i < waterPoints.length; i++) {
    const waterPoint = waterPoints[i]
    const holder = holders[i % holders.length] // Rotar entre holders

    waterMeters.push({
      holderId: holder.id,
      waterPointId: waterPoint.id,
      measurementUnit: 'm³',
      images: []
    })
  }

  await prisma.waterMeter.createMany({
    data: waterMeters
  })

  console.log(`📊 Created ${waterMeters.length} water meters`)
}

async function seedWaterMeterReadings() {
  // ← CORREGIR: NO eliminar aquí, solo crear
  const waterMeters = await prisma.waterMeter.findMany()

  const readings = []
  const attachments = []

  for (const waterMeter of waterMeters) {
    // Crear varias lecturas por medidor
    for (let i = 0; i < 3; i++) {
      const readingId = Id.generateUniqueId().toString()
      const readingDate = new Date(2024, 0, 15 + i * 30) // Enero, Febrero, Marzo

      readings.push({
        id: Id.generateUniqueId().toString(),
        waterMeterId: waterMeter.id,
        reading: (100 + i * 25).toString(), // 100, 125, 150
        normalizedReading: (100 + i * 25).toString(), // 100, 125, 150
        readingDate,
        notes: `Lectura mensual ${i + 1}`
      })

      // Crear attachments para cada lectura
      attachments.push({
        originalName: `lectura_${i + 1}.jpg`,
        fileName: `reading_${readingId}_1.jpg`,
        mimeType: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        path: `/uploads/reading_${readingId}_1.jpg`,
        waterMeterReadingId: readingId
      })

      attachments.push({
        originalName: `documento_${i + 1}.pdf`,
        fileName: `reading_${readingId}_2.pdf`,
        mimeType: 'application/pdf',
        size: 512 * 1024, // 512KB
        path: `/uploads/reading_${readingId}_2.pdf`,
        waterMeterReadingId: readingId
      })
    }
  }

  // Crear las lecturas
  await prisma.waterMeterReading.createMany({
    data: readings
  })

  // Crear los attachments
  await prisma.fileAttachment.createMany({
    data: attachments
  })

  console.log(
    `✅ Created ${readings.length} water meter readings with ${attachments.length} attachments`
  )
}
