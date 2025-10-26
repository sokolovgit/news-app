import {
  oauthAccounts,
  oauthAccountRelations,
  refreshTokens,
  refreshTokenRelations,
  emailVerificationRelations,
  emailVerifications,
} from '@/auth/domain/schemas';
import { sourceRelations, sources } from '@/sources/domain/schemas';
import { userRelations, users } from '@/users/domain/schemas';

const relations = {
  userRelations,
  oauthAccountRelations,
  refreshTokenRelations,
  emailVerificationRelations,
  sourceRelations,
};

const drizzleSchemas = {
  users,
  oauthAccounts,
  refreshTokens,
  emailVerifications,
  sources,
};

export const drizzle = {
  ...relations,
  ...drizzleSchemas,
};

export type Drizzle = typeof drizzle;
