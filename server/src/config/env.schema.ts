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

  DATABASE_URL: z.url(),

  REDIS_URL: z.url(),

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
});

export type EnvType = z.infer<typeof envValidationSchema>;
