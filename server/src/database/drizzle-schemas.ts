import { authPasswords } from '@/auth/domain/schemas';
import { users } from '@/users/domain/schemas';

export const drizzleSchemas = { users, authPasswords };

export type DrizzleSchemas = typeof drizzleSchemas;
