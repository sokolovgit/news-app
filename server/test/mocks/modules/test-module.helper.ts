import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module';

import { LoggerService } from '@/logger';
import { loggerServiceMock } from '../services';

export async function createTestModule(): Promise<{
  app: INestApplication;
  moduleFixture: TestingModule;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LoggerService)
    .useValue(loggerServiceMock)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.init();

  return { app, moduleFixture };
}
