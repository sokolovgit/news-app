import { UserRole } from '@/users/domain/enums';
import { UserId } from '@/users/domain/schemas';

export type CreateUserProps = {
  id?: UserId;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
};
