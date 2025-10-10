import { Module } from '@nestjs/common';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';

import { ConfigService } from '@/config';
import { drizzleSchemas } from './drizzle-schemas';

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pg: {
          connection: 'client',
          config: {
            connectionString: config.database.url,
          },
        },
        config: { logger: config.isDevelopment(), schema: drizzleSchemas },
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
