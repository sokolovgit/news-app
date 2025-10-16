import { Injectable } from '@nestjs/common';
import { OAuthAccountsRepository } from '../abstracts/oauth-accounts.repository';
import { UserId } from '@/users/domain/schemas';
import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthAccount } from '@/auth/domain/entities';

@Injectable()
export class OAuthAccountsService {
  constructor(
    private readonly oauthAccountsRepository: OAuthAccountsRepository,
  ) {}

  async isOAuthUserByUserId(userId: UserId) {
    return await this.oauthAccountsRepository.oauthAccountExistsForUser(userId);
  }

  async findByProviderAndId(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<OAuthAccount> {
    
  }
}
