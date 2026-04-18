import { ENV } from '../utils/env';

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'operator' | 'viewer';
}

export const users = {
  admin: (): User => ({
    username: ENV.username,
    password: ENV.password,
    role: 'admin',
  }),
} as const;
