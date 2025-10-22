import { Injectable } from '@nestjs/common';

import { UsersService } from '@/users/service/users-service';
import { OAuthAccountsService } from '../oauth-accounts';
import { HashingService } from '../hashing';
import { TokensService } from '../tokens';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  OAuthAccountRequiredError,
  EmailNotVerifiedError,
} from '@/auth/domain/errors';

import { UserRole } from '@/users/domain/enums';
import { AuthenticationResult } from './types/authentication-result.type';
import { LoggerService } from '@/logger';
import { EmailVerificationsService } from '../email-verifications';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly passwordsService: HashingService,
    private readonly oauthAccountsService: OAuthAccountsService,
    private readonly emailVerificationsService: EmailVerificationsService,
  ) {}

  async localLogin(
    email: string,
    password: string,
  ): Promise<AuthenticationResult> {
    this.logger.debug(`Attempting local login for email: ${email}`);

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      this.logger.debug(`User not found for email: ${email}`);
      throw new InvalidCredentialsError(email);
    }

    this.logger.debug(
      `User found, validating credentials for user ID: ${user.getId()}`,
    );

    const hashedPassword = user.getHashedPassword();

    if (!hashedPassword) {
      this.logger.debug(
        `No password hash found for user ID: ${user.getId()}, checking OAuth`,
      );

      const isOAuthUser = await this.oauthAccountsService.isOAuthUserByUserId(
        user.getId(),
      );

      if (isOAuthUser) {
        this.logger.debug(`User ${user.getId()} is OAuth-only user`);
        throw new OAuthAccountRequiredError(email);
      }

      this.logger.debug(`User ${user.getId()} has no password configured`);
      throw new InvalidCredentialsError(email);
    }

    const isValidPassword = await this.passwordsService.compareHashes(
      password,
      hashedPassword,
    );

    if (!isValidPassword) {
      this.logger.debug(`Invalid password for user ID: ${user.getId()}`);
      throw new InvalidCredentialsError(email);
    }

    this.logger.debug(
      `Password validated successfully for user ID: ${user.getId()}, issuing tokens`,
    );

    const isEmailVerified =
      await this.emailVerificationsService.isEmailVerified(user.getId());

    if (!isEmailVerified) {
      this.logger.debug(`Email not verified for user ID: ${user.getId()}`);
      throw new EmailNotVerifiedError(email);
    }

    const tokens = await this.tokensService.issueTokens(user);

    return { user, tokens };
  }

  async localRegister(
    email: string,
    password: string,
  ): Promise<AuthenticationResult> {
    this.logger.debug(`Attempting local registration for email: ${email}`);

    const existingUser = await this.usersService.getUserByEmail(email);

    if (existingUser) {
      this.logger.debug(`User already exists with email: ${email}`);
      throw new UserAlreadyExistsError(email);
    }

    this.logger.debug(`Email available, hashing password for: ${email}`);

    const hashedPassword = await this.passwordsService.hash(password);

    this.logger.debug(`Password hashed, creating user for: ${email}`);

    const user = await this.usersService.createUserOrThrow({
      email,
      password: hashedPassword,
      roles: [UserRole.USER],
    });

    this.logger.debug(
      `User created successfully with ID: ${user.getId()}, issuing tokens`,
    );

    await this.emailVerificationsService.sendEmailVerificationEmail(
      user.getId(),
    );

    const tokens = await this.tokensService.issueTokens(user);

    return { user, tokens };
  }
}
