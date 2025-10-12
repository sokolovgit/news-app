import { Module } from '@nestjs/common';
import { UsersRepository } from './abstracts';
import { DrizzleUsersRepository } from './users-storage/drizzle.users.repository';

@Module({
  providers: [
    {
      provide: UsersRepository,
      useClass: DrizzleUsersRepository,
    },
  ],
  exports: [UsersRepository],
})
export class ServiceModule {}
