/**
 * Test environment setup — runs before each test file.
 * Handles mocking of external dependencies.
 */

// Silence logger output during tests
jest.mock('../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  },
}));
