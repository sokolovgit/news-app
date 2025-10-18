import {
  oauthAccounts,
  oauthAccountRelations,
  refreshTokens,
  refreshTokenRelations,
} from '@/auth/domain/schemas';
import { userRelations, users } from '@/users/domain/schemas';

const relations = {
  userRelations,
  oauthAccountRelations,
  refreshTokenRelations,
};

const drizzleSchemas = {
  users,
  oauthAccounts,
  refreshTokens,
};

export const drizzle = {
  ...drizzleSchemas,
  ...relations,
};

export type Drizzle = typeof drizzle;
