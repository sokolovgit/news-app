import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule } from './commons/config';
import { RedisModule } from './commons/redis';
// import { RabbitmqModule } from './commons/rabbitmq';
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
    LoggerModule.forRootAsync(),
    RedisModule.forRoot(),
    // RabbitmqModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.redis.url,
        },
      }),
    }),
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
