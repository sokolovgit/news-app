import { UserSource } from '@/user-sources/domain';

export type LinkResult = {
  userSource: UserSource;
  created: boolean;
};
