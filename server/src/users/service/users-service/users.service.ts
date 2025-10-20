import { Injectable } from '@nestjs/common';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { UserCreationFailedError } from '@/users/domain/errors';
import { UsersRepository } from '../abstracts';
import { CreateUserProps } from './types/create-user.type';
import { LoggerService } from '@/logger';
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
    this.logger.debug(`Fetching user by ID: ${userId}`);

    const user = await this.usersRepository.getUserById(userId);

    if (user) {
      this.logger.debug(`User found with ID: ${userId}`);
    } else {
      this.logger.debug(`No user found with ID: ${userId}`);
    }

    return user;
  }

  /**
   * Retrieves a user by their email address
   */
  async getUserByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Fetching user by email: ${email}`);

    const user = await this.usersRepository.getUserByEmail(email);

    if (user) {
      this.logger.debug(`User found with email: ${email}, ID: ${user.getId()}`);
    } else {
      this.logger.debug(`No user found with email: ${email}`);
    }

    return user;
  }

  /**
   * Creates a new user or throws an error if creation fails
   */
  async createUserOrThrow(props: CreateUserProps): Promise<User> {
    this.logger.debug(`Creating new user with email: ${props.email}`);

    const newUser = new User({
      id: props.id ?? uuid<UserId>(),
      email: props.email,
      password: props.password,
      roles: props.roles,
    });

    this.logger.debug(`Saving new user to database with email: ${props.email}`);

    const savedUser = await this.usersRepository.save(newUser);

    if (!savedUser) {
      this.logger.debug(`Failed to save user with email: ${props.email}`);
      throw new UserCreationFailedError(props.email, 'Database save failed');
    }

    this.logger.debug(`User created successfully with ID: ${savedUser.getId()}`);

    return savedUser;
  }
}
