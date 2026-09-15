/**
 * Global Jest teardown — runs once after all test suites complete.
 * Closes database connections to allow Jest to exit cleanly.
 */
export default async function globalTeardown(): Promise<void> {
  // Database cleanup will be added when DB tests are implemented.
  // mongoose.connection.close() will be called here.
}
