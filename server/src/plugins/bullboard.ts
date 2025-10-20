import { createBullBoard } from '@bull-board/api';
import { INestApplication } from '@nestjs/common';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { Queue } from 'bullmq';
import { ConfigService } from '@/config';
import { EmailQueue } from '@/mails/domain/enums';

export const setupBullBoard = (app: INestApplication): void => {
  const configService = app.get(ConfigService);

  const redisUrl = configService.redis.url;
  const bullBoardPath = configService.bullboard.path;

  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath(`/${bullBoardPath}`);

  createBullBoard({
    queues: buildBullBoardQueues(redisUrl),
    serverAdapter,
  });

  app.use(`/${bullBoardPath}`, serverAdapter.getRouter());
};

const buildBullBoardQueues = (redisUrl: string): BullMQAdapter[] => {
  const queues = [...Object.values(EmailQueue)];

  return queues.map((queueName) => {
    return new BullMQAdapter(
      new Queue(queueName, {
        connection: {
          url: redisUrl,
        },
      }),
    );
  });
};
