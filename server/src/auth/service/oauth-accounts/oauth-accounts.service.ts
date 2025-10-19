import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { uuid } from '@/commons/utils';

import { OAuthAccountsRepository } from '../abstracts/oauth-accounts.repository';

import { UserId } from '@/users/domain/schemas';

import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthAccountId } from '@/auth/domain/schemas';

import { CreateOAuthAccountProps } from './types';

@Injectable()
export class OAuthAccountsService {
  constructor(
    private readonly oauthAccountsRepository: OAuthAccountsRepository,
  ) {}

  async isOAuthUserByUserId(userId: UserId): Promise<boolean> {
    return await this.oauthAccountsRepository.oauthAccountExistsForUser(userId);
  }

  async findByProviderWithUser(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<OAuthAccount | null> {
    return await this.oauthAccountsRepository.findOAuthAccountByProviderAndIdWithUser(
      provider,
      providerId,
    );
  }

  async createOAuthAccountOrThrow(
    props: CreateOAuthAccountProps,
  ): Promise<OAuthAccount> {
    const newOAuthAccount = new OAuthAccount(
      {
        id: props.id ?? uuid<OAuthAccountId>(),
        userId: props.userId,
        provider: props.provider,
        providerId: props.providerId,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
      { user: props.relations.user },
    );

    const savedOAuthAccount =
      await this.oauthAccountsRepository.save(newOAuthAccount);

    if (!savedOAuthAccount) {
      throw new InternalServerErrorException('Failed to create OAuth account');
    }

    return savedOAuthAccount;
  }
}
