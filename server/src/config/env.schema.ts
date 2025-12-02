import { z } from 'zod';

import { Environments } from '@/commons/enums';

export const envValidationSchema = z.object({
  NODE_ENV: z
    .enum([
      Environments.DEVELOPMENT,
      Environments.PRODUCTION,
      Environments.TEST,
    ])
    .default(Environments.DEVELOPMENT),

  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  DOCS_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .default(true),
  DOCS_PATH: z.string().default('api/docs'),

  BULLBOARD_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .default(true),
  BULLBOARD_PATH: z.string().default('bullboard'),

  SPELUNKER_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .default(true),

  DATABASE_URL: z.url(),

  REDIS_URL: z.url(),

  RABBITMQ_URL: z.url(),

  JWT_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USERNAME: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .default(false),

  MAIL_FROM: z.email(),

  TELEGRAM_APP_ID: z.string(),
  TELEGRAM_APP_HASH: z.string(),
  TELEGRAM_SESSION: z.string().optional().default(''),
  TELEGRAM_PHONE: z.string(),

  CLIENT_URL: z.url().default('http://localhost:3001'),

  // S3/MinIO Configuration
  S3_ENDPOINT: z.string().default('http://localhost:9001'),
  S3_ACCESS_KEY: z.string().default('admin'),
  S3_SECRET_KEY: z.string().default('password'),
  S3_BUCKET: z.string().default('news-app-media'),
  S3_REGION: z.string().default('us-east-1'),
});

export type EnvType = z.infer<typeof envValidationSchema>;
