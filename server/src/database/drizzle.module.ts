import { Module } from '@nestjs/common';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';

import { ConfigService } from '@/config';
import { drizzleSchemas } from './drizzle-schemas';
import { DRIZZLE_CONNECTION } from './constants';

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      inject: [ConfigService],
      tag: DRIZZLE_CONNECTION,
      useFactory: (config: ConfigService) => ({
        pg: {
          connection: 'client',
          config: {
            connectionString: config.database.url,
          },
        },
        config: {
          logger: config.isDevelopment(),
          schema: drizzleSchemas,
          casing: 'snake_case',
        },
      }),
    }),
  ],
  exports: [DrizzlePGModule],
  providers: [
    // {
    //   provide: 'MIGRATIONS',
    //   useFactory: async () => {
    //     // Use drizzle-kit or manual SQL here
    //     console.log('Migrations applied');
    //   },
    // },
  ],
})
export class DrizzleModule {}
