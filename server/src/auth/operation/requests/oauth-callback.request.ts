import { OAuthProvider } from '@/auth/domain/enums';

export type OAuthCallbackRequest =
  | { provider: OAuthProvider; code: string; error?: never }
  | { provider: OAuthProvider; error: string; code?: never };
