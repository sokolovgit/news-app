import { userRelations, users } from '@/users/domain/schemas';
import { sourceRelations, sources } from '@/sources/domain/schemas';
import {
  userSources,
  userSourceRelations,
} from '@/user-sources/domain/schemas';
import { rawPostRelations, rawPosts } from '@/posts/domain/schemas';
import {
  oauthAccounts,
  oauthAccountRelations,
  refreshTokens,
  refreshTokenRelations,
  emailVerificationRelations,
  emailVerifications,
} from '@/auth/domain/schemas';

const relations = {
  userRelations,
  userSourceRelations,
  oauthAccountRelations,
  refreshTokenRelations,
  emailVerificationRelations,
  sourceRelations,
  rawPostRelations,
};

const drizzleSchemas = {
  users,
  oauthAccounts,
  refreshTokens,
  emailVerifications,
  sources,
  userSources,
  rawPosts,
};

export const drizzle = {
  ...relations,
  ...drizzleSchemas,
};

export type Drizzle = typeof drizzle;
