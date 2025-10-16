import { users } from '@/users/domain/schemas';
import { oauthAccounts } from '@/auth/domain/schemas';

export const drizzleSchemas = { users, oauthAccounts };

export type DrizzleSchemas = typeof drizzleSchemas;
