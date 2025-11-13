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
import { LoadState } from '@/commons/types';

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
      { user: LoadState.notLoaded() },
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
      user = await this.jwtService.getUserFromJwtTokenOrThrow(token, {
        withEmailVerification: true,
      });
    } catch (error) {
      this.logger.error(`Error getting user from JWT token: ${error}`);
      throw new InvalidEmailVerificationTokenError();
    }

    if (user.isEmailVerified()) {
      throw new EmailAlreadyVerifiedError('Email already verified');
    }

    try {
      await this.createEmailVerificationOrThrow({
        id: user.getId(),
      });
    } catch (error) {
      this.logger.error(`Error saving email verification: ${error}`);
      throw new FailedToVerifyEmailError(user.getId());
    }
  }

  async sendEmailVerificationEmail(userId: UserId): Promise<void> {
    const user = await this.usersService.getUserById(userId, {
      withEmailVerification: true,
    });

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    if (user.isEmailVerified()) {
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to News App!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Please verify your email address</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for signing up! To get started, please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" 
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                  Verify Email Address
      </a>
              </div>
              
              <p style="margin: 30px 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; color: #2563eb; font-size: 13px; word-break: break-all; font-family: monospace;">
                ${verifyUrl}
              </p>
              
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  If you didn't create an account with News App, you can safely ignore this email.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} News App. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailVerificationUrl(token: string): string {
    const clientUrl = this.configService.client.url;
    // Puts the token as a query string parameter - points to client verification page
    return `${clientUrl}/verify-email?token=${encodeURIComponent(token)}`;
  }
}
