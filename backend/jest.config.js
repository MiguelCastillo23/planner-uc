export default {
  testEnvironment: 'node',
  transform: {},
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js',
    '!run-e2e-server.js',
    '!seed.js',
    '!models/Schemas.js'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    },
    './controllers/**/*.js': {
      branches: 85,
      functions: 85
    },
    './src/engine/**/*.js': {
      branches: 85,
      functions: 85
    }
  }
};
