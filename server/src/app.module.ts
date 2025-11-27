import { BullModule } from '@nestjs/bullmq';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule } from './commons/config';
import { RedisModule } from './commons/redis';
import { CacheModule } from './commons/cache';
// import { RabbitmqModule } from './commons/rabbitmq';
import { ConfigService, envValidationSchema } from './config';
import { LoggerModule, RequestLoggerMiddleware } from './logger';

import { ActiveUserInterceptor } from './user-activity/interceptors';

import { AuthModule } from './auth/auth.module';
import { MailsModule } from './mails/mails.module';
import { UsersModule } from './users/users.module';
import { DrizzleModule } from './database';
import { CookiesModule } from './cookies';
import { SourcesModule } from './sources/sources.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { PostsModule } from './posts/posts.module';
import { ComplaintsModule } from './complaints/complaints.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      providers: [ConfigService],
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync(),
    RedisModule.forRoot(),
    CacheModule.forRoot(),
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
    UserActivityModule,
    PostsModule,
    ComplaintsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActiveUserInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*path');
  }
}
