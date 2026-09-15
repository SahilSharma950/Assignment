'use strict';

/**
 * Global Jest teardown — runs once after all test suites complete (CJS format required).
 * Closes any shared resources (DB connections, etc.) added in future tasks.
 */
async function globalTeardown() {
  // Future tasks will close MongoDB and Redis connections here
}

module.exports = globalTeardown;
