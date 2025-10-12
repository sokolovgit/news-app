import { UserRole } from '../enums';
import { UserId } from '../schemas';

export class User {
  constructor(
    private readonly user: {
      id: UserId;
      email: string;
      roles: UserRole[];
      createdAt: Date;
      updatedAt: Date;
    },
  ) {
    this.user = user;
  }
}
