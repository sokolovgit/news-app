import { config, DotenvConfigOptions } from 'dotenv';
import { expand, DotenvExpandOptions } from 'dotenv-expand';

export type LoadEnvOptions = Partial<{
  config: DotenvConfigOptions;
  expand: DotenvExpandOptions;
}>;

export const loadEnv = (options: LoadEnvOptions = {}) =>
  expand({
    ...config(options.config),
    ...options.expand,
  });
