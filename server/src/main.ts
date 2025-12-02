import { loadEnv } from './config';
loadEnv();

import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from './config';
import { AllExceptionsFilter } from './errors';
import { LoggerService } from './logger';
import { setupSwagger, setupBullBoard, setupSpelunker } from './plugins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: config.client.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const isDocsEnabled = config.docs.enabled;

  if (isDocsEnabled) {
    setupSwagger(app);
  }

  const isBullboardEnabled = config.bullboard.enabled;

  if (isBullboardEnabled) {
    setupBullBoard(app);
  }

  const isSpelunkerEnabled = config.spelunker.enabled;

  if (isSpelunkerEnabled) {
    setupSpelunker(app);
  }

  const { host, port } = config.server;

  await app.listen(port, host);

  const appUrl = await app.getUrl();

  logger.log(`Application is running on: ${appUrl}`, 'NestApplication');

  if (isDocsEnabled) {
    const docsPath = config.docs.path;
    logger.log(`API Docs are available at: ${appUrl}/${docsPath}`, 'Swagger');
  }

  if (isBullboardEnabled) {
    const bullboardPath = config.bullboard.path;
    logger.log(
      `Bullboard is available at: ${appUrl}/${bullboardPath}`,
      'Bullboard',
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
