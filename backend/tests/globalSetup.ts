/**
 * Global Jest setup — runs once before all test suites.
 * Connects to a test MongoDB instance (via env or in-memory).
 */
export default async function globalSetup(): Promise<void> {
  process.env['NODE_ENV'] = 'test';
  process.env['MONGODB_URI'] = process.env['TEST_MONGODB_URI'] ?? 'mongodb://localhost:27017/mini-saas-test';
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-minimum-32-characters-long';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-characters-long';
  process.env['REDIS_HOST'] = 'localhost';
  process.env['REDIS_PORT'] = '6379';
  process.env['LOG_LEVEL'] = 'error';
  process.env['LOG_DIR'] = './logs';
}
