/** @type {import('jest').Config} */
const config = {
  displayName: 'backend',
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.{spec,test}.ts'],
  moduleNameMapper: {
    // Path aliases — must mirror tsconfig.json paths
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@queues/(.*)$': '<rootDir>/src/queues/$1',
    '^@sockets/(.*)$': '<rootDir>/src/sockets/$1',
    // Strip .js extensions from ESM imports so Jest resolves the TS source
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: {
          ignoreCodes: [151002],
        },
        tsconfig: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
  globalSetup: '<rootDir>/tests/globalSetup.cjs',
  globalTeardown: '<rootDir>/tests/globalTeardown.cjs',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
    '!src/config/swagger.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 30,
      lines: 40,
      statements: 40,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
};

module.exports = config;
