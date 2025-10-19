import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ConfigService } from '@/config';

export const createDocument = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const docsPath = configService.docs.path;

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token',
      },
      'access-token',
    )
    .addCookieAuth('refresh-token', {
      type: 'http',
      scheme: 'bearer',
      description: 'Refresh token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(docsPath, app, document, {
    explorer: true,
    jsonDocumentUrl: `${docsPath}.json`,
  });
};
