import { Request } from 'express';
import { Observable } from 'rxjs';
import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';

import { UserId } from '@/users/domain/schemas';
import { UserActivityService } from '../services';

@Injectable()
export class ActiveUserInterceptor implements NestInterceptor {
  constructor(private readonly userActivityService: UserActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    const userId = request.user?.getId();

    if (!userId) {
      return next.handle();
    }

    this.trackUserActivity(userId).catch(() => {});

    return next.handle();
  }

  private async trackUserActivity(userId: UserId): Promise<void> {
    const sourceIds =
      await this.userActivityService.getUserFollowedSourceIds(userId);

    if (sourceIds.length === 0) {
      return;
    }

    this.userActivityService.markUserActiveForSources(sourceIds, userId);
  }
}
