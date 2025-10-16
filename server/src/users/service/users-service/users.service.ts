import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { UsersRepository } from '../abstracts';
import { CreateUserProps } from './types/create-user.type';
import { uuid } from '@/commons/utils';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserById(userId: UserId): Promise<User | null> {
    return this.usersRepository.getUserById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.getUserByEmail(email);
  }

  async createUserOrThrow(props: CreateUserProps): Promise<User> {
    const newUser = new User({
      id: props.id ?? uuid<UserId>(),
      email: props.email,
      password: props.password,
      roles: props.roles,
    });
    const savedUser = await this.usersRepository.save(newUser);

    if (!savedUser) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return savedUser;
  }
}
