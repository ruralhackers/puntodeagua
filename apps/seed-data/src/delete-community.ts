import { client as prisma } from '@pda/database'

function parseArgs(argv: string[]) {
  const flags = new Set(argv.filter((a) => a.startsWith('-')))
  const positional = argv.filter((a) => !a.startsWith('-'))
  return {
    communityRef: positional[0],
    confirm: flags.has('--confirm') || flags.has('-y')
  }
}

async function resolveCommunity(communityRef: string) {
  const byId = await prisma.community.findUnique({ where: { id: communityRef } })
  if (byId) return byId

  const byName = await prisma.community.findFirst({ where: { name: communityRef } })
  if (byName) return byName

  return null
}

async function deleteCommunity(communityId: string) {
  const zones = await prisma.communityZone.findMany({
    where: { communityId },
    select: { id: true }
  })
  const zoneIds = zones.map((z) => z.id)

  const waterPoints = await prisma.waterPoint.findMany({
    where: { communityZoneId: { in: zoneIds } },
    select: { id: true }
  })
  const waterPointIds = waterPoints.map((p) => p.id)

  const meters = await prisma.waterMeter.findMany({
    where: { waterPointId: { in: waterPointIds } },
    select: { id: true, waterAccountId: true }
  })
  const meterIds = meters.map((m) => m.id)
  const accountIds = [...new Set(meters.map((m) => m.waterAccountId))]

  const incidents = await prisma.incident.findMany({
    where: { communityId },
    select: { id: true }
  })
  const incidentIds = incidents.map((i) => i.id)

  const users = await prisma.user.findMany({
    where: { communityId },
    select: { id: true }
  })
  const userIds = users.map((u) => u.id)

  console.log('  Scope:')
  console.log(`    users:          ${userIds.length}`)
  console.log(`    fee payments:   ${await prisma.feePayment.count({ where: { communityId } })}`)
  console.log(`    fee config:     ${await prisma.feeConfig.count({ where: { communityId } })}`)
  console.log(`    incidents:      ${incidentIds.length}`)
  console.log(`    analyses:       ${await prisma.analysis.count({ where: { communityId } })}`)
  console.log(`    providers:      ${await prisma.provider.count({ where: { communityId } })}`)
  console.log(`    meters:         ${meterIds.length}`)
  console.log(`    water points:   ${waterPointIds.length}`)
  console.log(`    water accounts: ${accountIds.length} (only if unused after)`)
  console.log(`    zones:          ${zoneIds.length}`)
  console.log(
    `    deposits:       ${await prisma.waterDeposit.count({ where: { communityId } })}`
  )

  await prisma.$transaction(async (tx) => {
    await tx.feePayment.deleteMany({ where: { communityId } })
    await tx.feeConfig.deleteMany({ where: { communityId } })

    if (incidentIds.length > 0) {
      await tx.incidentImage.deleteMany({ where: { incidentId: { in: incidentIds } } })
    }
    await tx.incident.deleteMany({ where: { communityId } })
    await tx.analysis.deleteMany({ where: { communityId } })
    await tx.provider.deleteMany({ where: { communityId } })

    if (meterIds.length > 0) {
      const readings = await tx.waterMeterReading.findMany({
        where: { waterMeterId: { in: meterIds } },
        select: { id: true }
      })
      const readingIds = readings.map((r) => r.id)
      if (readingIds.length > 0) {
        await tx.waterMeterReadingImage.deleteMany({
          where: { waterMeterReadingId: { in: readingIds } }
        })
      }
      await tx.waterMeterReading.deleteMany({ where: { waterMeterId: { in: meterIds } } })
      await tx.waterMeterImage.deleteMany({ where: { waterMeterId: { in: meterIds } } })
      await tx.waterMeter.deleteMany({ where: { id: { in: meterIds } } })
    }

    if (waterPointIds.length > 0) {
      await tx.waterPoint.deleteMany({ where: { id: { in: waterPointIds } } })
    }

    // Accounts with no remaining meters (avoids deleting shared accounts if any)
    if (accountIds.length > 0) {
      const stillUsed = await tx.waterMeter.findMany({
        where: { waterAccountId: { in: accountIds } },
        select: { waterAccountId: true }
      })
      const stillUsedIds = new Set(stillUsed.map((m) => m.waterAccountId))
      const orphanAccountIds = accountIds.filter((id) => !stillUsedIds.has(id))
      if (orphanAccountIds.length > 0) {
        await tx.waterAccount.deleteMany({ where: { id: { in: orphanAccountIds } } })
      }
    }

    await tx.communityZone.deleteMany({ where: { communityId } })
    await tx.waterDeposit.deleteMany({ where: { communityId } })

    if (userIds.length > 0) {
      // Account/Session cascade via User relation onDelete
      await tx.user.deleteMany({ where: { id: { in: userIds } } })
    }

    await tx.community.delete({ where: { id: communityId } })
  })
}

async function main() {
  const { communityRef, confirm } = parseArgs(process.argv.slice(2))

  if (!communityRef) {
    console.error('\n❌ Usage: bun run src/delete-community.ts "<community-name-or-id>" --confirm')
    console.error(
      'Example: bun run src/delete-community.ts "Comunidad de Aguas Vilasobroso, Mondariz" --confirm\n'
    )
    const communities = await prisma.community.findMany({ select: { id: true, name: true } })
    if (communities.length > 0) {
      console.error('Communities in DB:')
      for (const c of communities) {
        console.error(`  - ${c.name} (${c.id})`)
      }
    }
    process.exit(1)
  }

  const community = await resolveCommunity(communityRef)
  if (!community) {
    console.error(`\n❌ Community not found: "${communityRef}"`)
    const communities = await prisma.community.findMany({ select: { id: true, name: true } })
    if (communities.length > 0) {
      console.error('\nCommunities in DB:')
      for (const c of communities) {
        console.error(`  - ${c.name} (${c.id})`)
      }
    }
    process.exit(1)
  }

  if (!confirm) {
    console.error(`\n⚠️  This will permanently delete community "${community.name}" and its data.`)
    console.error('Other communities will not be touched.')
    console.error('❌ Re-run with --confirm or -y to proceed.')
    console.error(
      `Example: bun run src/delete-community.ts "${community.name}" --confirm\n`
    )
    process.exit(1)
  }

  console.log(`\n🗑️  Deleting community "${community.name}" (${community.id})...`)
  await deleteCommunity(community.id)
  console.log('✅ Community deleted successfully\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
