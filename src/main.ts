import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDocument } from './plugins/swagger';

async function bootstrap() {
  const logger = new Logger(AppModule.name);

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);

  const port = config.get<string>('port') || '3000';
  const host = config.get<string>('host') || '0.0.0.0';

  const isDocsEnabled = config.get<boolean>('docs.enabled');

  if (isDocsEnabled) {
    createDocument(app);
  }

  await app.listen(port, host);

  const appUrl = await app.getUrl();

  logger.log(`🚀 Application is running on: ${appUrl}`);

  if (isDocsEnabled) {
    const docsPath = config.get<string>('docs.path');
    logger.log(`📚 API Docs are available at: ${appUrl}/${docsPath}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
