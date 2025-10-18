import { UserRole } from '@/users/domain/enums';
import { UserId } from '@/users/domain/schemas';

export type JwtPayload = {
  sub: UserId;
  email: string;
  roles: UserRole[];
};
