import { Module } from '@nestjs/common';
import { UsersRepository } from './abstracts';
import { DrizzleUsersRepository } from './users-storage/drizzle.users.repository';
import { UsersService } from './users-service';

const services = [UsersService];

@Module({
  providers: [
    {
      provide: UsersRepository,
      useClass: DrizzleUsersRepository,
    },
    ...services,
  ],
  exports: [...services],
})
export class ServiceModule {}
