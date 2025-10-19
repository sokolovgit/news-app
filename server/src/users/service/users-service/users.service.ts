import { Injectable } from '@nestjs/common';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { UserCreationFailedError } from '@/users/domain/errors';
import { UsersRepository } from '../abstracts';
import { CreateUserProps } from './types/create-user.type';
import { LoggerService } from '@/commons/logger';
import { uuid } from '@/commons/utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Retrieves a user by their ID
   */
  async getUserById(userId: UserId): Promise<User | null> {
    const user = await this.usersRepository.getUserById(userId);

    return user;
  }

  /**
   * Retrieves a user by their email address
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.getUserByEmail(email);

    return user;
  }

  /**
   * Creates a new user or throws an error if creation fails
   */
  async createUserOrThrow(props: CreateUserProps): Promise<User> {
    const newUser = new User({
      id: props.id ?? uuid<UserId>(),
      email: props.email,
      password: props.password,
      roles: props.roles,
    });

    const savedUser = await this.usersRepository.save(newUser);

    if (!savedUser) {
      throw new UserCreationFailedError(props.email, 'Database save failed');
    }

    return savedUser;
  }
}
