import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterRequest } from '../requests';
import { UsersService } from '@/users/service/users-service';

import { PasswordsService } from '@/auth/service/passwords';
import { UserRole } from '@/users/domain/enums';

@Injectable()
export class RegisterHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordsService: PasswordsService,
  ) {}

  async handle(request: RegisterRequest) {
    const { email, password } = request;

    const existingUser = await this.usersService.getUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await this.passwordsService.hashPassword(password);

    const user = await this.usersService.createUserOrThrow({
      email,
      password: hashedPassword,
      roles: [UserRole.USER],
    });

    return user;
  }
}
