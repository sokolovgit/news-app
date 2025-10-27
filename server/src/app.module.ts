import { BullModule } from '@nestjs/bullmq';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { ConfigModule } from './commons/config';
import { ConfigService, envValidationSchema } from './config';
import { LoggerModule, RequestLoggerMiddleware } from './logger';

import { AuthModule } from './auth/auth.module';
import { MailsModule } from './mails/mails.module';
import { UsersModule } from './users/users.module';
import { DrizzleModule } from './database';
import { CookiesModule } from './cookies';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      providers: [ConfigService],
      validationSchema: envValidationSchema,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.redis.url,
        },
      }),
    }),
    LoggerModule.forRootAsync(),
    CookiesModule.forRoot(),
    DrizzleModule,
    UsersModule,
    AuthModule,
    MailsModule,
    SourcesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*path');
  }
}
