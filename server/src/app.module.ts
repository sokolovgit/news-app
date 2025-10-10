import { Module } from '@nestjs/common';

import { ConfigModule } from './commons/config';
import { ConfigService, envValidationSchema } from './config';
import { DrizzleModule } from './database';

@Module({
  imports: [
    ConfigModule.forRoot({
      providers: [ConfigService],
      validationSchema: envValidationSchema,
    }),
    DrizzleModule,
  ],
})
export class AppModule {}
