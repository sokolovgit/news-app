import { DynamicModule, Logger, Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

import { ConfigService } from '@/config';

import { S3_CLIENT, S3_BUCKET } from './s3.constants';
import { S3Service } from './s3.service';

@Module({})
export class S3Module {
  static forRoot(): DynamicModule {
    return {
      module: S3Module,
      global: true,
      providers: [
        {
          provide: S3_CLIENT,
          inject: [ConfigService],
          useFactory: (configService: ConfigService): S3Client => {
            const logger = new Logger(S3Module.name);

            const client = new S3Client({
              endpoint: configService.s3.endpoint,
              region: configService.s3.region,
              credentials: {
                accessKeyId: configService.s3.accessKey,
                secretAccessKey: configService.s3.secretKey,
              },
              forcePathStyle: true, // Required for MinIO
            });

            logger.log(
              `S3 client initialized (endpoint: ${configService.s3.endpoint}, bucket: ${configService.s3.bucket})`,
            );

            return client;
          },
        },
        {
          provide: S3_BUCKET,
          inject: [ConfigService],
          useFactory: (configService: ConfigService): string => {
            return configService.s3.bucket;
          },
        },
        S3Service,
      ],
      exports: [S3Service, S3_CLIENT],
    };
  }
}
