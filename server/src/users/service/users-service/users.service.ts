import { Injectable } from '@nestjs/common';

import { uuid } from '@/commons/utils';
import { LoadState, PaginatedResult, PaginationParams } from '@/commons/types';

import { LoggerService } from '@/logger';

import { UserId } from '@/users/domain/schemas';
import { UsersRepository, UsersFilterParams } from '../abstracts';
import { User, UserLoadOptions } from '@/users/domain/entities';
import { UserCreationFailedError } from '@/users/domain/errors';

import { CreateUserProps } from './types/create-user.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Retrieves a user by their ID
   */
  async getUserById(
    userId: UserId,
    loadOptions?: UserLoadOptions,
  ): Promise<User | null> {
    this.logger.debug(
      `Fetching user by ID: ${userId} with load options: ${JSON.stringify(loadOptions)}`,
    );

    const user = await this.usersRepository.getUserById(userId, loadOptions);

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
  async getUserByEmail(
    email: string,
    loadOptions?: UserLoadOptions,
  ): Promise<User | null> {
    this.logger.debug(
      `Fetching user by email: ${email} with load options: ${JSON.stringify(loadOptions)}`,
    );

    const user = await this.usersRepository.getUserByEmail(email, loadOptions);

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

    const newUser = new User(
      {
        id: props.id ?? uuid<UserId>(),
        email: props.email,
        password: props.password,
        roles: props.roles,
      },
      {
        emailVerification: LoadState.notLoaded(),
        oauthAccounts: LoadState.notLoaded(),
        refreshToken: LoadState.notLoaded(),
      },
    );

    this.logger.debug(`Saving new user to database with email: ${props.email}`);

    const savedUser = await this.usersRepository.save(newUser);

    if (!savedUser) {
      this.logger.debug(`Failed to save user with email: ${props.email}`);
      throw new UserCreationFailedError(props.email, 'Database save failed');
    }

    this.logger.debug(
      `User created successfully with ID: ${savedUser.getId()}`,
    );

    return savedUser;
  }

  /**
   * Get all users with pagination and filters (admin only)
   */
  async getAllUsersPaginated(
    params: PaginationParams,
    filters?: UsersFilterParams,
    loadOptions?: UserLoadOptions,
  ): Promise<PaginatedResult<User>> {
    this.logger.debug(
      `Getting all users paginated: ${JSON.stringify(params)}, filters: ${JSON.stringify(filters)}`,
    );

    return this.usersRepository.getAllUsersPaginated(
      params,
      filters,
      loadOptions,
    );
  }
}
