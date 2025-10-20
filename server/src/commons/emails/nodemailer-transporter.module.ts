import { DynamicModule, Module } from '@nestjs/common';
import { createTransport } from 'nodemailer';

import { ConfigService } from '@/config';

export const NODEMAILER_TRANSPORTER = 'NODEMAILER_TRANSPORTER';

@Module({})
export class NodemailerTransporterModule {
  static forRootAsync(): DynamicModule {
    return {
      module: NodemailerTransporterModule,
      providers: [
        {
          provide: NODEMAILER_TRANSPORTER,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const { host, port, auth, secure } = config.smtp;

            const transporter = createTransport({
              host,
              port,
              secure,
              auth,
            });

            return transporter;
          },
        },
      ],
      exports: [NODEMAILER_TRANSPORTER],
    };
  }
}
