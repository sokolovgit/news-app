import { Injectable, NotImplementedException } from '@nestjs/common';
import { OAuthLoginStrategy } from '../interfaces';
import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthUser } from '../types';

@Injectable()
export class GoogleOAuthStrategy implements OAuthLoginStrategy {
  getAuthorizationUrl(): string {
    throw new NotImplementedException('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback(_code: string): Promise<OAuthUser> {
    throw new NotImplementedException('Not implemented');
  }

  getProvider(): OAuthProvider {
    return OAuthProvider.GOOGLE;
  }

  supports(provider: OAuthProvider): boolean {
    return provider === OAuthProvider.GOOGLE;
  }
}
