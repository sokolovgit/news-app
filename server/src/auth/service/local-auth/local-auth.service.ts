import { Injectable } from '@nestjs/common';

import { UsersService } from '@/users/service/users-service';
import { OAuthAccountsService } from '../oauth-accounts';
import { HashingService } from '../hashing';
import { TokensService } from '../tokens';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  OAuthAccountRequiredError,
} from '@/auth/domain/errors';

import { UserRole } from '@/users/domain/enums';
import { AuthenticationResult } from './types/authentication-result.type';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly passwordsService: HashingService,
    private readonly oauthAccountsService: OAuthAccountsService,
  ) {}

  async localLogin(
    email: string,
    password: string,
  ): Promise<AuthenticationResult> {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError(email);
    }

    const hashedPassword = user.getHashedPassword();

    if (!hashedPassword) {
      const isOAuthUser = await this.oauthAccountsService.isOAuthUserByUserId(
        user.getId(),
      );

      if (isOAuthUser) {
        throw new OAuthAccountRequiredError(email);
      }

      throw new InvalidCredentialsError(email);
    }

    const isValidPassword = await this.passwordsService.compareHashes(
      password,
      hashedPassword,
    );

    if (!isValidPassword) {
      throw new InvalidCredentialsError(email);
    }

    const tokens = await this.tokensService.issueTokens(user);

    return { user, tokens };
  }

  async localRegister(
    email: string,
    password: string,
  ): Promise<AuthenticationResult> {
    const existingUser = await this.usersService.getUserByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const hashedPassword = await this.passwordsService.hash(password);

    const user = await this.usersService.createUserOrThrow({
      email,
      password: hashedPassword,
      roles: [UserRole.USER],
    });

    const tokens = await this.tokensService.issueTokens(user);

    return { user, tokens };
  }
}
