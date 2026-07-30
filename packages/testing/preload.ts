import { prepareTestDatabase } from './db-harness'

// Runs once before any test file, via [test].preload in bunfig.toml.
//
// Creating the database and applying the schema from a beforeAll hook made the
// first test file to run pay the whole cost, and that blew bun's 5s hook
// timeout on slower CI runners depending on which file happened to go first.
//
// Unit tests share this preload and need no database, so this is a no-op unless
// DATABASE_URL points at a test database. A test that actually needs the
// database still hits the guard in db-harness if it is missing.
const databaseName = process.env.DATABASE_URL?.split('/').pop()?.split('?')[0]

if (databaseName?.endsWith('_test')) {
  await prepareTestDatabase()
}
