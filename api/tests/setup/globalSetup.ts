/**
 * Global test setup — runs once before all test suites.
 *
 * Loads the test environment variables so that env.ts can validate them.
 * Create a `.env.test` file (see `.env.example`) with a test database URL
 * before running `npm run test`.
 */
export async function setup() {
  process.env.APP_STAGE = 'test'
  process.env.NODE_ENV = 'test'
}

export async function teardown() {
  // nothing to clean up at the global level
}
