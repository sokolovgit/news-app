import {
  EmailVerification,
  EmailVerificationLoadOptions,
} from '@/auth/domain/entities';
import { UserId } from '@/users/domain/schemas';

export abstract class EmailVerificationsRepository {
  abstract save(
    emailVerification: EmailVerification,
  ): Promise<EmailVerification | null>;

  abstract findByUserId(
    userId: UserId,
    loadOptions?: EmailVerificationLoadOptions,
  ): Promise<EmailVerification | null>;

  abstract existsByUserId(userId: UserId): Promise<boolean>;
}
