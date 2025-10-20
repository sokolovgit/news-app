/* eslint-disable @typescript-eslint/no-unused-vars */

import { createBullBoard } from '@bull-board/api';
import { INestApplication } from '@nestjs/common';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { Queue } from 'bullmq';
import { ConfigService } from '@/config';

export const setupBullBoard = (app: INestApplication): void => {
  const configService = app.get(ConfigService);

  const redisUrl = configService.redis.url;
  const bullBoardPath = configService.bullboard.path;

  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath(`/${bullBoardPath}`);

  createBullBoard({
    queues: [],
    serverAdapter,
  });

  app.use(`/${bullBoardPath}`, serverAdapter.getRouter());
};
