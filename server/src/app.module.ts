import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { ConfigModule } from './commons/config';
import { ConfigService, envValidationSchema } from './config';
import { DrizzleModule } from './database';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CookiesModule } from './commons/cookies';
import { LoggerModule, RequestLoggerMiddleware } from './logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      providers: [ConfigService],
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync(),
    CookiesModule.forRoot(),
    DrizzleModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*path');
  }
}
