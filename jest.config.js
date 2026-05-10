module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/services/index.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  setupFiles: ['dotenv/config'],
};
