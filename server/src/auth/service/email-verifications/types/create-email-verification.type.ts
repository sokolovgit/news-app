// import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

// type CreateEmailVerificationRelations = {
//   user: User;
// };

export type CreateEmailVerificationProps = {
  id: UserId;
  createdAt?: Date;
  updatedAt?: Date;

  // relations: CreateEmailVerificationRelations;
};
