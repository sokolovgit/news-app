import { Source, UserSource } from '@/sources/domain/entities';

export type AddSourceResponse = {
  source: Source;
  userSource: UserSource;
  isNewSource: boolean;
  isNewLink: boolean;
};
