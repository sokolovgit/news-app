import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { createDocument } from './plugins/swagger';
import { ConfigService } from '@/config/config.service';

async function bootstrap() {
  const logger = new Logger(AppModule.name);

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);

  const { host, port } = config.server;
  const { enabled: isDocsEnabled, path: docsPath } = config.docs;

  if (isDocsEnabled) {
    createDocument(app);
  }

  await app.listen(port, host);

  const appUrl = await app.getUrl();

  logger.log(`🚀 Application is running on: ${appUrl}`);

  if (isDocsEnabled) {
    logger.log(`📚 API Docs are available at: ${appUrl}/${docsPath}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
