import { Injectable } from '@nestjs/common';

import { UsersService } from '@/users/service/users-service';
import { LoggerService } from '@/logger';
import { EmailVerificationsService } from '@/auth/service/email-verifications';

import { UserId } from '@/users/domain/schemas';
import { UserNotFoundError } from '@/users/domain/errors';
import { GetMeResponse } from '../response';

@Injectable()
export class GetMeHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly emailVerificationsService: EmailVerificationsService,
  ) {}

  async handle(userId: UserId): Promise<GetMeResponse> {
    const process = 'get-me';
    const processId = this.logger.startProcess(process, { userId });

    this.logger.logProcessProgress(processId, process, 'Fetching user by ID', {
      userId,
    });

    const user = await this.usersService.getUserById(userId, {
      withEmailVerification: true,
    });

    if (!user) {
      this.logger.logProcessProgress(processId, process, 'User not found', {
        userId,
      });

      throw new UserNotFoundError('User not found');
    }

    const emailVerified = user.isEmailVerified();

    return { user, emailVerified };
  }
}
