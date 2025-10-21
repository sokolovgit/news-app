import { Module } from '@nestjs/common';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { drizzle } from './drizzle-definition';
import { DRIZZLE_CONNECTION } from './constants';
import { DrizzleLogger } from './drizzle.logger';

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      inject: [ConfigService, LoggerService],
      tag: DRIZZLE_CONNECTION,
      useFactory: (config: ConfigService, logger: LoggerService) => ({
        pg: {
          connection: 'client',
          config: {
            connectionString: config.database.url,
          },
        },
        config: {
          logger: config.isDevelopment() ? new DrizzleLogger(logger) : false,
          schema: drizzle,
          casing: 'snake_case',
        },
      }),
    }),
  ],
  exports: [DrizzlePGModule],
})
export class DrizzleModule {}
