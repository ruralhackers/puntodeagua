import { Id, saltAndHashPassword } from '@pda/common/domain'
import { client as prisma } from '@pda/database'
import { WaterAccountFactory } from '@pda/water-account'
import fs from 'fs'
import path from 'path'
import type { CommunitySeedData } from './types/community-seed-data'

export async function seedCommunity(communityName: string) {
  const jsonPath = path.join(__dirname, '../info-files', `${communityName}.json`)

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found: ${jsonPath}`)
    process.exit(1)
  }

  console.log(`\n🌊 Starting ${communityName} seed from JSON...\n`)

  let jsonData: CommunitySeedData
  try {
    jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  } catch (error) {
    console.error('❌ Error parsing JSON file:', error)
    process.exit(1)
  }

  // 1. Create Community
  console.log('📍 Creating community...')
  const existingCommunity = await prisma.community.findFirst({
    where: { name: jsonData.community.name }
  })

  if (existingCommunity) {
    console.error(`❌ Community "${jsonData.community.name}" already exists`)
    process.exit(1)
  }

  const community = await prisma.community.create({
    data: {
      name: jsonData.community.name,
      waterLimitRule: jsonData.community.waterLimitRule
    }
  })
  console.log(`✅ Community created: ${community.name}`)

  // 2. Create Water Deposits
  console.log('\n💧 Creating water deposits...')
  const deposits = await Promise.all(
    jsonData.deposits.map((deposit) =>
      prisma.waterDeposit.create({
        data: {
          ...deposit,
          communityId: community.id
        }
      })
    )
  )
  console.log(`✅ Created ${deposits.length} deposit(s)`)

  // 3. Create Community Zones
  console.log('\n🗺️  Creating zones...')
  const zones = await Promise.all(
    jsonData.zones.map((zone) =>
      prisma.communityZone.create({
        data: {
          ...zone,
          communityId: community.id
        }
      })
    )
  )
  const zoneMap = new Map<string, string>(zones.map((z) => [z.name, z.id]))
  console.log(`✅ Created ${zones.length} zones: ${zones.map((z) => z.name).join(', ')}`)

  // 4. Create Users
  console.log('\n👥 Creating users...')
  for (const userData of jsonData.users) {
    await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: await saltAndHashPassword(userData.password),
        roles: userData.roles,
        communityId: community.id
      }
    })
  }
  console.log(`✅ Created ${jsonData.users.length} user(s)`)

  // 5. Create Water Accounts
  console.log('\n👤 Creating water accounts...')
  const accounts = await Promise.all(
    jsonData.waterAccounts.map((account) =>
      prisma.waterAccount.create({
        data: {
          name: account.name,
          nationalId: account.nationalId,
          notes: account.notes || ''
        }
      })
    )
  )
  const accountMap = new Map<string, string>()
  jsonData.waterAccounts.forEach((acc, idx) => {
    const account = accounts[idx]
    if (account) {
      accountMap.set(acc.tempId, account.id)
    }
  })
  console.log(`✅ Created ${accounts.length} water accounts`)

  // 6. Create Water Points
  console.log('\n🏠 Creating water points...')
  const waterPoints = await Promise.all(
    jsonData.waterPoints.map((wpData) => {
      const zoneId = zoneMap.get(wpData.zone)
      if (!zoneId) {
        throw new Error(`Zone not found: ${wpData.zone}`)
      }

      return prisma.waterPoint.create({
        data: {
          name: wpData.name,
          location: wpData.location,
          cadastralReference: wpData.cadastralReference,
          fixedPopulation: wpData.fixedPopulation,
          floatingPopulation: wpData.floatingPopulation,
          notes: wpData.notes,
          communityZoneId: zoneId,
          waterDepositIds: deposits.map((d) => d.id)
        }
      })
    })
  )
  const pointMap = new Map<string, string>()
  jsonData.waterPoints.forEach((wp, idx) => {
    const point = waterPoints[idx]
    if (point) {
      pointMap.set(wp.tempId, point.id)
    }
  })
  console.log(`✅ Created ${waterPoints.length} water points`)

  // 7. Create Water Meters (without last reading data)
  console.log('\n⚙️  Creating water meters...')
  const meterMap = new Map<string, string>()
  let meterCount = 0

  for (const meterData of jsonData.waterMeters) {
    const waterAccountId = accountMap.get(meterData.waterAccountId)
    const waterPointId = pointMap.get(meterData.waterPointId)

    if (!waterAccountId) {
      console.warn(`⚠️  Water account not found: ${meterData.waterAccountId}`)
      continue
    }
    if (!waterPointId) {
      console.warn(`⚠️  Water point not found: ${meterData.waterPointId}`)
      continue
    }

    const waterMeter = await prisma.waterMeter.create({
      data: {
        name: meterData.name,
        waterAccountId,
        waterPointId,
        measurementUnit: meterData.measurementUnit,
        isActive: meterData.isActive
      }
    })

    const meterKey = `${meterData.waterAccountId}_${meterData.waterPointId}`
    meterMap.set(meterKey, waterMeter.id)
    meterCount++
  }
  console.log(`✅ Created ${meterCount} water meters`)

  // 8. Create Water Meter Readings using service
  console.log('\n📊 Creating water meter readings...')
  const service = WaterAccountFactory.waterMeterReadingCreatorService()
  let readingCount = 0

  for (const meterData of jsonData.waterMeters) {
    const meterKey = `${meterData.waterAccountId}_${meterData.waterPointId}`
    const waterMeterId = meterMap.get(meterKey)

    if (!waterMeterId) {
      console.warn(`⚠️  Water meter not found for key: ${meterKey}`)
      continue
    }

    const sortedReadings = [...meterData.readings].sort(
      (a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
    )

    for (const readingData of sortedReadings) {
      try {
        await service.run({
          waterMeterId: Id.fromString(waterMeterId),
          reading: readingData.reading.toString(),
          date: new Date(readingData.readingDate),
          notes: readingData.notes || undefined
        })
        readingCount++
      } catch (error) {
        console.warn(
          `⚠️  Error creating reading for meter ${meterData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
  }
  console.log(`✅ Created ${readingCount} water meter readings`)

  // Summary
  console.log('\n🎉 Seed completed successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`   - Community: ${community.name}`)
  console.log(`   - Deposits: ${deposits.length}`)
  console.log(`   - Zones: ${zones.length}`)
  console.log(`   - Users: ${jsonData.users.length}`)
  console.log(`   - Water Accounts: ${accounts.length}`)
  console.log(`   - Water Points: ${waterPoints.length}`)
  console.log(`   - Water Meters: ${meterCount}`)
  console.log(`   - Readings: ${readingCount}`)

  await prisma.$disconnect()
}
