'use strict';

/**
 * Global Jest setup — runs once before all test suites (CJS format required by Jest globalSetup).
 * Sets test environment variables so no .env file is needed for tests.
 */
async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI ?? 'mongodb://localhost:27017/mini-saas-test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters-long!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long!!';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.LOG_LEVEL = 'error';
  process.env.LOG_DIR = './logs';
  process.env.APP_VERSION = '1.0.0';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
}

module.exports = globalSetup;
