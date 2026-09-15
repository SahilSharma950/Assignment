'use strict';

/**
 * Jest per-suite setup — runs after the test framework installs in each worker (CJS format required).
 * Mocks the Winston logger to suppress log output during test runs.
 */

jest.mock('../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  },
}));
