import { AuthPasswordId } from '../schemas';
import { UserId } from '@/users/domain/schemas';

export class AuthPassword {
  constructor(
    private readonly authPassword: {
      id: AuthPasswordId;
      userId: UserId;
      passwordHash: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ) {
    this.authPassword = authPassword;
  }
}
