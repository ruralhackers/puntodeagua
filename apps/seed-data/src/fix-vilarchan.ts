import { client as prisma } from '@pda/database'
import fs from 'fs'
import path from 'path'
import type { CommunitySeedData } from './types/community-seed-data'

const COMMUNITY_NAME = 'Vilarchán'

type MeterWithRelations = Awaited<ReturnType<typeof loadCommunityMeters>>[number]

interface ExpectedRow {
  connectionNumber: string
  accountName: string
  nationalId: string
  waterPointName: string
  location: string
  cadastralReference: string
  zoneName: string
  isActive: boolean
  meterName: string
}

interface FieldChange {
  entity: string
  field: string
  from: string
  to: string
}

interface RowResult {
  connectionNumber: string
  status: 'updated' | 'unchanged' | 'not_found' | 'ambiguous'
  changes: FieldChange[]
  message?: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  return {
    apply: args.includes('--apply'),
    dryRun: !args.includes('--apply')
  }
}

function normalizeConnectionNumber(value: string): string {
  return value.replace(/^Contador\s+/i, '').trim()
}

function loadJson(): CommunitySeedData {
  const jsonPath = path.join(__dirname, '../info-files/vilarchan.json')
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON not found: ${jsonPath}`)
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as CommunitySeedData
}

function buildExpectedRows(json: CommunitySeedData): ExpectedRow[] {
  const accountByTempId = new Map(json.waterAccounts.map((a) => [a.tempId, a]))
  const pointByTempId = new Map(json.waterPoints.map((p) => [p.tempId, p]))

  return json.waterMeters.map((meter) => {
    const account = accountByTempId.get(meter.waterAccountId)
    const point = pointByTempId.get(meter.waterPointId)
    if (!account || !point) {
      throw new Error(
        `Invalid JSON references for meter ${meter.waterPointId}: account=${meter.waterAccountId}, point=${meter.waterPointId}`
      )
    }

    const connectionNumber = point.connectionNumber?.trim()
    if (!connectionNumber) {
      throw new Error(`Missing connectionNumber on water point ${point.tempId}`)
    }

    return {
      connectionNumber,
      accountName: account.name,
      nationalId: account.nationalId,
      waterPointName: point.name,
      location: point.location,
      cadastralReference: point.cadastralReference,
      zoneName: point.zone,
      isActive: meter.isActive,
      meterName: meter.name
    }
  })
}

async function loadCommunityMeters(communityId: string) {
  return prisma.waterMeter.findMany({
    where: {
      waterPoint: {
        communityZone: {
          communityId
        }
      }
    },
    include: {
      waterAccount: true,
      waterPoint: {
        include: {
          communityZone: true
        }
      }
    }
  })
}

function findMeterForConnection(
  connectionNumber: string,
  allMeters: MeterWithRelations[]
): MeterWithRelations | 'not_found' | 'ambiguous' {
  const byPointConnection = allMeters.filter(
    (meter) => meter.waterPoint.connectionNumber?.trim() === connectionNumber
  )
  const uniqueByPoint = [...new Map(byPointConnection.map((m) => [m.id, m])).values()]

  if (uniqueByPoint.length === 1) {
    return uniqueByPoint[0] as MeterWithRelations
  }
  if (uniqueByPoint.length > 1) {
    return 'ambiguous'
  }

  const byName = allMeters.filter(
    (meter) => normalizeConnectionNumber(meter.name) === connectionNumber
  )
  const uniqueByName = [...new Map(byName.map((m) => [m.id, m])).values()]

  if (uniqueByName.length === 1) {
    return uniqueByName[0] as MeterWithRelations
  }
  if (uniqueByName.length > 1) {
    return 'ambiguous'
  }

  const byAccountNationalId = allMeters.filter(
    (meter) => meter.waterAccount.nationalId.trim() === connectionNumber
  )
  const uniqueByAccount = [...new Map(byAccountNationalId.map((m) => [m.id, m])).values()]

  if (uniqueByAccount.length === 1) {
    return uniqueByAccount[0] as MeterWithRelations
  }
  if (uniqueByAccount.length > 1) {
    return 'ambiguous'
  }

  return 'not_found'
}

function resolveMeter(
  connectionNumber: string,
  allMeters: MeterWithRelations[]
): { meter?: MeterWithRelations; status: 'ok' | 'not_found' | 'ambiguous' } {
  const result = findMeterForConnection(connectionNumber, allMeters)
  if (result === 'not_found') return { status: 'not_found' }
  if (result === 'ambiguous') return { status: 'ambiguous' }
  return { meter: result, status: 'ok' }
}

function pushChange(
  changes: FieldChange[],
  entity: string,
  field: string,
  from: unknown,
  to: unknown
) {
  const fromStr = String(from ?? '')
  const toStr = String(to ?? '')
  if (fromStr !== toStr) {
    changes.push({ entity, field, from: fromStr, to: toStr })
  }
}

function planRowUpdate(
  expected: ExpectedRow,
  meter: MeterWithRelations,
  zoneIdByName: Map<string, string>
): FieldChange[] {
  const changes: FieldChange[] = []
  const account = meter.waterAccount
  const point = meter.waterPoint
  const zoneId = zoneIdByName.get(expected.zoneName)

  if (!zoneId) {
    throw new Error(`Zone not found in database: ${expected.zoneName}`)
  }

  pushChange(changes, `account:${account.id}`, 'name', account.name, expected.accountName)
  pushChange(changes, `account:${account.id}`, 'nationalId', account.nationalId, expected.nationalId)
  pushChange(
    changes,
    `point:${point.id}`,
    'connectionNumber',
    point.connectionNumber,
    expected.connectionNumber
  )
  pushChange(changes, `point:${point.id}`, 'name', point.name, expected.waterPointName)
  pushChange(changes, `point:${point.id}`, 'location', point.location, expected.location)
  pushChange(
    changes,
    `point:${point.id}`,
    'cadastralReference',
    point.cadastralReference,
    expected.cadastralReference
  )
  pushChange(changes, `point:${point.id}`, 'communityZoneId', point.communityZoneId, zoneId)
  pushChange(changes, `meter:${meter.id}`, 'name', meter.name, expected.meterName)
  pushChange(changes, `meter:${meter.id}`, 'isActive', meter.isActive, expected.isActive)

  return changes
}

async function applyChanges(changes: FieldChange[]) {
  for (const change of changes) {
    const [entityType, entityId] = change.entity.split(':')

    if (entityType === 'account') {
      await prisma.waterAccount.update({
        where: { id: entityId },
        data: { [change.field]: change.to }
      })
      continue
    }

    if (entityType === 'point') {
      const data =
        change.field === 'communityZoneId'
          ? { communityZoneId: change.to }
          : change.field === 'connectionNumber'
            ? { connectionNumber: change.to || null }
            : { [change.field]: change.to }
      await prisma.waterPoint.update({
        where: { id: entityId },
        data
      })
      continue
    }

    if (entityType === 'meter') {
      const data =
        change.field === 'isActive' ? { isActive: change.to === 'true' } : { [change.field]: change.to }
      await prisma.waterMeter.update({
        where: { id: entityId },
        data
      })
    }
  }
}

function printRowChanges(result: RowResult) {
  if (result.status === 'not_found' || result.status === 'ambiguous') {
    console.log(`  ⚠️  ${result.connectionNumber}: ${result.message}`)
    return
  }

  if (result.changes.length === 0) {
    console.log(`  ✓ ${result.connectionNumber}: sin cambios`)
    return
  }

  console.log(`  ✏️  ${result.connectionNumber}:`)
  for (const change of result.changes) {
    console.log(`      ${change.entity}.${change.field}: "${change.from}" → "${change.to}"`)
  }
}

async function main() {
  const { apply, dryRun } = parseArgs()
  const json = loadJson()

  if (json.community.name !== COMMUNITY_NAME) {
    throw new Error(`Expected community "${COMMUNITY_NAME}" in JSON, got "${json.community.name}"`)
  }

  const community = await prisma.community.findFirst({
    where: { name: COMMUNITY_NAME }
  })

  if (!community) {
    throw new Error(`Community "${COMMUNITY_NAME}" not found in database`)
  }

  const expectedRows = buildExpectedRows(json)
  const meters = await loadCommunityMeters(community.id)

  const zones = await prisma.communityZone.findMany({
    where: { communityId: community.id }
  })
  const zoneIdByName = new Map(zones.map((zone) => [zone.name, zone.id]))

  console.log(`\n🔧 Vilarchán import fix (${dryRun ? 'DRY RUN' : 'APPLY'})\n`)
  console.log(`   Community: ${community.name} (${community.id})`)
  console.log(`   Meters in DB: ${meters.length}`)
  console.log(`   Rows in JSON: ${expectedRows.length}\n`)

  const results: RowResult[] = []

  for (const expected of expectedRows) {
    const resolved = resolveMeter(expected.connectionNumber, meters)

    if (resolved.status === 'not_found') {
      results.push({
        connectionNumber: expected.connectionNumber,
        status: 'not_found',
        changes: [],
        message: 'no matching meter in database'
      })
      continue
    }

    if (resolved.status === 'ambiguous') {
      results.push({
        connectionNumber: expected.connectionNumber,
        status: 'ambiguous',
        changes: [],
        message: 'multiple meters matched'
      })
      continue
    }

    const meter = resolved.meter
    if (!meter) continue

    const changes = planRowUpdate(expected, meter, zoneIdByName)

    if (changes.length > 0 && apply) {
      await applyChanges(changes)
    }

    results.push({
      connectionNumber: expected.connectionNumber,
      status: changes.length > 0 ? 'updated' : 'unchanged',
      changes
    })
  }

  for (const result of results) {
    printRowChanges(result)
  }

  const updated = results.filter((r) => r.status === 'updated').length
  const unchanged = results.filter((r) => r.status === 'unchanged').length
  const notFound = results.filter((r) => r.status === 'not_found').length
  const ambiguous = results.filter((r) => r.status === 'ambiguous').length
  const totalChanges = results.reduce((sum, r) => sum + r.changes.length, 0)

  console.log('\n📊 Summary:')
  console.log(`   Updated rows:  ${updated}`)
  console.log(`   Unchanged:     ${unchanged}`)
  console.log(`   Not found:     ${notFound}`)
  console.log(`   Ambiguous:     ${ambiguous}`)
  console.log(`   Field changes: ${totalChanges}`)

  if (dryRun && totalChanges > 0) {
    console.log('\n💡 Re-run with --apply to write changes.\n')
  } else if (apply && totalChanges > 0) {
    console.log('\n✅ Changes applied.\n')
  } else {
    console.log('')
  }

  if (notFound > 0 || ambiguous > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Fix failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
