import { PublicSource } from '@/sources/domain/enums';

export type ValidatedSourceUrl = {
  url: string;
  name: string;
  source: PublicSource;
};
