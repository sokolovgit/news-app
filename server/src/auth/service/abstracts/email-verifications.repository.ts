import { EmailVerification } from '@/auth/domain/entities';

export abstract class EmailVerificationsRepository {
  abstract save(
    emailVerification: EmailVerification,
  ): Promise<EmailVerification | null>;
  abstract findByUserId(userId: string): Promise<EmailVerification | null>;
  abstract existsByUserId(userId: string): Promise<boolean>;
}
