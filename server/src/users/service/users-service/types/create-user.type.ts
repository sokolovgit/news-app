import { UserId } from '@/users/domain/schemas';
import { UserRole } from '@/users/domain/enums';

export type CreateUserProps = {
  id?: UserId;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
};
