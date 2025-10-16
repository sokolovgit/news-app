import { Module } from '@nestjs/common';

import { ConfigModule } from './commons/config';
import { ConfigService, envValidationSchema } from './config';
import { DrizzleModule } from './database';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      providers: [ConfigService],
      validationSchema: envValidationSchema,
    }),
    DrizzleModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
