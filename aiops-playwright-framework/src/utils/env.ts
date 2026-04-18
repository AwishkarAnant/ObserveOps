export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  get baseUrl(): string {
    return getEnv('BASE_URL');
  },
  get apiUrl(): string {
    return getEnv('API_URL');
  },
  get username(): string {
    return getEnv('APP_USERNAME');
  },
  get password(): string {
    return getEnv('APP_PASSWORD');
  },
  get name(): string {
    return process.env.TEST_ENV ?? 'dev';
  },
};
