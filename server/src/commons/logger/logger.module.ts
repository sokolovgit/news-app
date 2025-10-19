import { Module, Global, DynamicModule, Type } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { RequestLoggerMiddleware } from './middlewares';
import { ConfigService } from '@/config';

/**
 * Global logger module providing logging services throughout the application.
 * Use `forRootAsync()` for proper initialization with ConfigService dependency.
 */
@Global()
@Module({})
export class LoggerModule {
  /**
   * Configures the logger module with async dependency injection.
   * This is the recommended method for setting up the logger.
   */
  static forRootAsync(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LoggerService,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return new LoggerService(configService);
          },
        },
        RequestLoggerMiddleware,
      ],
      exports: [LoggerService],
      global: true,
    };
  }

  /**
   * Returns the RequestLoggerMiddleware class for use in middleware configuration.
   */
  static getRequestLoggerMiddleware(): Type<RequestLoggerMiddleware> {
    return RequestLoggerMiddleware;
  }
}
