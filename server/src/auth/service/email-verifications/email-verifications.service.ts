import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { JwtService } from '../jwt-service';
import { MailService } from '@/mails/service/mail-service';
import { UsersService } from '@/users/service/users-service';
import { LoggerService } from '@/logger';
import { ConfigService } from '@/config';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

import { EmailContentType } from '@/mails/domain/enums';
import { EmailVerification } from '@/auth/domain/entities';
import { EmailVerificationsRepository } from '../abstracts/email-verifications.repository';
import { CreateEmailVerificationProps } from './types/create-email-verification.type';

import {
  FailedToVerifyEmailError,
  EmailAlreadyVerifiedError,
  InvalidEmailVerificationTokenError,
} from '@/auth/domain/errors';
import { UserNotFoundError } from '@/users/domain/errors';

@Injectable()
export class EmailVerificationsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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

  async verifyEmail(token: string): Promise<void> {
    let user: User;

    try {
      user = await this.jwtService.getUserFromJwtTokenOrThrow(token);
    } catch (error) {
      this.logger.error(`Error getting user from JWT token: ${error}`);
      throw new InvalidEmailVerificationTokenError();
    }

    const existingEmailVerification =
      await this.emailVerificationsRepository.findByUserId(user.getId());

    if (existingEmailVerification) {
      throw new EmailAlreadyVerifiedError('Email already verified');
    }

    try {
      await this.createEmailVerificationOrThrow({
        id: user.getId(),
        relations: {
          user: user,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving email verification: ${error}`);
      throw new FailedToVerifyEmailError(user.getId());
    }
  }

  async sendEmailVerificationEmail(userId: UserId): Promise<void> {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const emailVerification =
      await this.emailVerificationsRepository.findByUserId(userId);

    if (emailVerification) {
      throw new EmailAlreadyVerifiedError('Email already verified');
    }

    const emailVerificationToken =
      await this.jwtService.generateJwtTokenFromUser(user);

    await this.mailService.sendEmail({
      to: user.getEmail(),
      subject: 'Verify your email',
      payload: this.getEmailHtmlContent(emailVerificationToken),
      contentType: EmailContentType.HTML,
    });
  }

  private getEmailHtmlContent(emailVerificationToken: string): string {
    const verifyUrl = this.getEmailVerificationUrl(emailVerificationToken);

    return `
      <p>Click the button below to verify your email:</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; border-radius: 4px; text-decoration: none;">
        Verify email
      </a>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>DEBUG: ${emailVerificationToken}</p>
    `;
  }

  private getEmailVerificationUrl(token: string): string {
    const baseUrl = `http://${this.configService.server.host}${this.configService.server.port ? `:${this.configService.server.port}` : ''}`;
    // Puts the token as a query string parameter
    return `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  }
}
