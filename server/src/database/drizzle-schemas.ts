import { users } from '@/users/domain/schemas';
import { oauthAccounts, refreshTokens } from '@/auth/domain/schemas';

export const drizzleSchemas = { users, oauthAccounts, refreshTokens };

export type DrizzleSchemas = typeof drizzleSchemas;
