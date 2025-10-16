import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '@/users/service/users-service';
import { PasswordsService } from '@/auth/service/passwords-service';
import { OAuthAccountsService } from '@/auth/service/oauth-accounts-service';

import { LoginRequest } from '../requests/login.request';

@Injectable()
export class LoginHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordsService: PasswordsService,
    private readonly oauthAccountsService: OAuthAccountsService,
  ) {}

  public async handle(request: LoginRequest) {
    const { email, password } = request;

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = user.getHashedPassword();

    if (!hashedPassword) {
      const isOAuthUser = await this.oauthAccountsService.isOAuthUserByUserId(
        user.getId(),
      );

      if (isOAuthUser) {
        throw new InternalServerErrorException('');
      }

      throw new UnauthorizedException(
        'Account created via OAuth. Set a password to use email/password login.',
      );
    }

    const isValidPassword = await this.passwordsService.comparePasswords(
      password,
      hashedPassword,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid creadentials');
    }
  }
}
