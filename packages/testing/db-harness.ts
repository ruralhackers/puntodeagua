import { execSync } from 'node:child_process'
import { client as prisma } from '@pda/database'

// Refuses to run against anything that is not a test database. The production
// URL lives commented out in .env.local one character away from being active,
// and packages/database has a db:sync:force script that runs --force-reset.
function assertTestDatabase(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Run tests with --env-file=.env.test')
  }
  const databaseName = url.split('/').pop()?.split('?')[0]
  if (!databaseName?.endsWith('_test')) {
    throw new Error(
      `Refusing to run tests against "${databaseName}": the database name must end in _test`
    )
  }
  return databaseName
}

export async function ensureTestDatabase(): Promise<void> {
  const databaseName = assertTestDatabase()
  const adminUrl = (process.env.DATABASE_URL as string).replace(`/${databaseName}`, '/postgres')

  // CREATE DATABASE cannot run inside a transaction, and Prisma cannot connect
  // to a database that does not exist yet, so this goes through raw pg.
  const { Client } = await import('pg')
  const client = new Client({ connectionString: adminUrl })
  await client.connect()
  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName
    ])
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`)
    }
  } finally {
    await client.end()
  }
}

export async function applySchema(): Promise<void> {
  assertTestDatabase()
  // The repo has no migrations directory (it uses db push), so the DDL is
  // generated from the schema on every run and can never drift.
  const ddl = execSync(
    'bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
    { cwd: `${import.meta.dir}/../database`, encoding: 'utf-8' }
  )

  // $executeRawUnsafe runs one statement at a time, so the script is split.
  // Comment lines are stripped first: prisma prefixes every statement with a
  // "-- CreateTable" style comment, so splitting on ';' would otherwise leave
  // every chunk starting with a comment.
  const statements = ddl
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement)
  }
}

export async function resetDatabase(): Promise<void> {
  assertTestDatabase()
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `
  if (tables.length === 0) return
  const list = tables.map((table) => `"public"."${table.tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`)
}

let schemaApplied = false

export async function setupTestDatabase(): Promise<void> {
  await ensureTestDatabase()
  if (!schemaApplied) {
    await applySchema()
    schemaApplied = true
  }
  await resetDatabase()
}
