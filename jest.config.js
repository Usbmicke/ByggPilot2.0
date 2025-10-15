
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Denna enda rad hanterar ALLA @/-alias, vilket är mer robust.
    '^@/(.*)$ ': '<rootDir>/$1',
  }
};

module.exports = createJestConfig(customJestConfig);
