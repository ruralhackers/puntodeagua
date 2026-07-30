import { prepareTestDatabase } from './db-harness'

// Runs before any test file, via [test].preload in bunfig.toml.
//
// Creating the database and applying the schema from a beforeAll hook made the
// first test file to run pay the whole cost, which blew bun's 5s hook timeout on
// slower CI runners depending on which file happened to go first.
//
// Gated on an explicit flag, not on the shape of DATABASE_URL: bun auto-loads
// .env.test whenever NODE_ENV=test, so the unit suite also ends up with the test
// database URL in its environment and would try to connect to a database that
// is not there.
if (process.env.PDA_INTEGRATION === '1') {
  await prepareTestDatabase()
}
