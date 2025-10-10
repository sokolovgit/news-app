import { users } from '@/users/domain/schema';

export const drizzleSchemas = { ...users };

export type DrizzleSchemas = typeof drizzleSchemas;
