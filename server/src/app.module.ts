import { BullModule } from '@nestjs/bullmq';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { S3Module } from './commons/s3';
import { RedisModule } from './commons/redis';
import { CacheModule } from './commons/cache';
import { ConfigModule } from './commons/config';
import { ConfigService, envValidationSchema } from './config';
import { LoggerModule, RequestLoggerMiddleware } from './logger';

import { ActiveUserInterceptor } from './user-activity/interceptors';

import { AuthModule } from './auth/auth.module';
import { MailsModule } from './mails/mails.module';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { RawPostsModule } from './raw-posts/raw-posts.module';
import { ArticlesModule } from './articles/articles.module';
import { DrizzleModule } from './database';
import { CookiesModule } from './cookies';
import { SourcesModule } from './sources/sources.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      providers: [ConfigService],
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync(),
    RedisModule.forRoot(),
    CacheModule.forRoot(),
    S3Module.forRoot(),
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
    RawPostsModule,
    ArticlesModule,
    ComplaintsModule,
    MediaModule,
    AdminModule,
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
