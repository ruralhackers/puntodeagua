import { client as prisma } from '@pda/database'

async function deleteAll() {
  await prisma.user.deleteMany({})
  await prisma.waterMeterReading.deleteMany({})
  await prisma.waterMeter.deleteMany({})
  await prisma.waterAccount.deleteMany({})
  await prisma.waterPoint.deleteMany({})
  await prisma.waterDeposit.deleteMany({})
  await prisma.analysis.deleteMany({}) // Delete analyses before communities
  await prisma.incident.deleteMany({}) // Delete incidents before communities
  await prisma.communityZone.deleteMany({})
  await prisma.community.deleteMany({})
}

async function main() {
  const args = process.argv.slice(2)
  const hasConfirmFlag = args.includes('--confirm') || args.includes('-y')

  if (!hasConfirmFlag) {
    console.error('\n⚠️  ADVERTENCIA: Esta acción borrará TODOS los datos de la base de datos')
    console.error('Esto incluye:')
    console.error('  - Usuarios')
    console.error('  - Lecturas de medidores')
    console.error('  - Medidores de agua')
    console.error('  - Cuentas de agua')
    console.error('  - Puntos de agua')
    console.error('  - Depósitos de agua')
    console.error('  - Análisis')
    console.error('  - Incidentes')
    console.error('  - Zonas de comunidad')
    console.error('  - Comunidades\n')
    console.error('❌ Para confirmar, ejecuta el script con el flag --confirm o -y')
    console.error('Ejemplo: bun run src/delete-all.ts --confirm\n')
    process.exit(1)
  }

  console.log('\n🗑️  Borrando datos...')
  await deleteAll()
  console.log('✅ Todos los datos han sido borrados exitosamente\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
