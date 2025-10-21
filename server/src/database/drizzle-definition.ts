import {
  oauthAccounts,
  oauthAccountRelations,
  refreshTokens,
  refreshTokenRelations,
  emailVerificationRelations,
  emailVerifications,
} from '@/auth/domain/schemas';
import { userRelations, users } from '@/users/domain/schemas';

const relations = {
  userRelations,
  oauthAccountRelations,
  refreshTokenRelations,
  emailVerificationRelations,
};

const drizzleSchemas = {
  users,
  oauthAccounts,
  refreshTokens,
  emailVerifications,
};

export const drizzle = {
  ...relations,
  ...drizzleSchemas,
};

export type Drizzle = typeof drizzle;
