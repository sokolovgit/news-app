import { z } from 'zod';

export const envValidationSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  DOCS_ENABLED: z.boolean().default(true),
  DOCS_PATH: z.string().default('api/docs'),
});

export type EnvType = z.infer<typeof envValidationSchema>;
