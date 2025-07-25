import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/app/api'],
  testMatch: ['**/*.test.ts'],
};

export default config;
