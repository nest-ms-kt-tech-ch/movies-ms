import { jest } from '@jest/globals';

describe('envs (config)', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('loads with explicit PORT and required vars', () => {
    process.env.OMDB_API_KEY = 'k';
    process.env.OMDB_HOST = 'https://example.com';
    process.env.PORT = '3002';

    jest.isolateModules(() => {
      const { envs } = require('src/config/envs');
      expect(envs.PORT).toBe(3002);
      expect(envs.OMDB_API_KEY).toBe('k');
      expect(envs.OMDB_HOST).toBe('https://example.com');
    });
  });

  it('throws if OMDB_HOST is not a valid uri', () => {
    process.env.OMDB_API_KEY = 'k';
    process.env.OMDB_HOST = 'not-a-uri';

    expect(() => {
      jest.isolateModules(() => {
        require('src/config/envs');
      });
    }).toThrow(/Config validation error/i);
  });
});