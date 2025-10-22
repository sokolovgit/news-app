import { Environments } from '@/commons/enums';
import { config, DotenvConfigOptions } from 'dotenv';
import { expand, DotenvExpandOptions } from 'dotenv-expand';

export type LoadEnvOptions = Partial<{
  config: DotenvConfigOptions;
  expand: DotenvExpandOptions;
}>;

export const loadEnv = (
  options: LoadEnvOptions = {
    config: {
      debug: process.env.NODE_ENV !== Environments.PRODUCTION,
      quiet: process.env.NODE_ENV === Environments.PRODUCTION,
    },
  },
) => {
  const result = expand({
    ...config(options.config),
    ...options.expand,
  });
  console.log('Environment variables loaded successfully');
  return result;
};
