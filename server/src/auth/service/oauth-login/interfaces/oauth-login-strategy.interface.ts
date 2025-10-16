import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthUser } from '../types';

export interface OAuthLoginStrategy {
  getAuthorizationUrl(): string;
  callback(code: string): Promise<OAuthUser>;
  getProvider(): OAuthProvider;
  supports(provider: OAuthProvider): boolean;
}
