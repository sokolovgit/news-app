import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Injectable, Inject } from '@nestjs/common';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { EmailVerificationsRepository } from '../abstracts/email-verifications.repository';
import { DrizzleEmailVerificationEntityMapper } from './mappers';
import { EmailVerification } from '@/auth/domain/entities';
import { UserId, users, UserSelect } from '@/users/domain/schemas';
import { emailVerifications } from '@/auth/domain/schemas';

@Injectable()
export class DrizzleEmailVerificationsRepository extends EmailVerificationsRepository {
  private mapper: DrizzleEmailVerificationEntityMapper;

  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
    this.mapper = new DrizzleEmailVerificationEntityMapper();
  }

  async save(
    emailVerification: EmailVerification,
  ): Promise<EmailVerification | null> {
    return this.db.transaction(async (tx) => {
      const user: UserSelect | undefined = await tx.query.users.findFirst({
        where: eq(users.id, emailVerification.getId()),
      });

      if (!user) {
        throw new Error('Cannot save EmailVerification: User does not exist');
      }

      const emailVerificationData = this.mapper.toSchema(emailVerification);

      const [savedEmailVerification] = await tx
        .insert(emailVerifications)
        .values(emailVerificationData)
        .onConflictDoUpdate({
          target: emailVerifications.id,
          set: emailVerificationData,
        })
        .returning();

      return savedEmailVerification
        ? this.mapper.toEntity({
            ...savedEmailVerification,
            user: user,
          })
        : null;
    });
  }

  async findByUserId(userId: UserId): Promise<EmailVerification | null> {
    const emailVerification = await this.db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.id, userId),
      with: {
        user: true,
      },
    });

    return emailVerification ? this.mapper.toEntity(emailVerification) : null;
  }

  async existsByUserId(userId: UserId): Promise<boolean> {
    return !!(await this.db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.id, userId),
      columns: {
        id: true,
      },
    }));
  }
}
