import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { LoggerService } from '@/logger';

import { UserId } from '@/users/domain/schemas';

import { EmailVerification } from '@/auth/domain/entities';
import { EmailVerificationsRepository } from '../abstracts/email-verifications.repository';
import { CreateEmailVerificationProps } from './types/create-email-verification.type';

@Injectable()
export class EmailVerificationsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly emailVerificationsRepository: EmailVerificationsRepository,
  ) {}

  async createEmailVerificationOrThrow(
    props: CreateEmailVerificationProps,
  ): Promise<EmailVerification> {
    const emailVerification = new EmailVerification(
      {
        id: props.id,

        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
      { user: props.relations.user },
    );

    const savedEmailVerification =
      await this.emailVerificationsRepository.save(emailVerification);

    if (!savedEmailVerification) {
      throw new InternalServerErrorException(
        'Failed to create email verification',
      );
    }

    return savedEmailVerification;
  }

  async isEmailVerified(userId: UserId): Promise<boolean> {
    return await this.emailVerificationsRepository.existsByUserId(userId);
  }
}
