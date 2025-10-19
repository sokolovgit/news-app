import { UserRole } from '@/users/domain/enums';

export type AuthMetadata = {
  roles?: UserRole[];
};
