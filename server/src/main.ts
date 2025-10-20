import { loadEnv } from './config/load-env';
loadEnv();

import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from './config';
import { AllExceptionsFilter } from './commons/errors';
import { LoggerService } from './logger';
import { setupSwagger, setupBullBoard } from './plugins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableCors();

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

  const { host, port } = config.server;

  await app.listen(port, host);

  const appUrl = await app.getUrl();

  logger.log(`🚀 Application is running on: ${appUrl}`, 'N');

  if (isDocsEnabled) {
    const docsPath = config.docs.path;
    logger.log(`📚 API Docs are available at: ${appUrl}/${docsPath}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
