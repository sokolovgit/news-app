import { Collector, PublicSource } from '@/sources/domain/enums';

export type ValidatedSourceUrl = {
  url: string;
  name: string;
  source: PublicSource;
  collector: Collector;
};
