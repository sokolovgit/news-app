import { Source } from '@/sources/domain/entities';
import { UserSource } from '@/user-sources/domain/entities';

export type AddSourceResponse = {
  source: Source;
  userSource: UserSource;
  isNewSource: boolean;
  isNewLink: boolean;
};
