import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/logger';
import {
  ComplaintTargetType,
  ComplaintReason,
} from '@/complaints/domain/enums';
import { InvalidComplaintError } from '@/complaints/domain/errors';
import { SourcesService } from '@/sources/service/sources-service';
import { RawPostsService } from '@/posts/service/raw-posts-service';
import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '@/posts/domain/schemas';

@Injectable()
export class ComplaintsValidationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly rawPostsService: RawPostsService,
  ) {}

  async validateTarget(
    targetType: ComplaintTargetType,
    targetId: string,
  ): Promise<void> {
    this.logger.log(`Validating complaint target: ${targetType} ${targetId}`);

    if (targetType === ComplaintTargetType.SOURCE) {
      const source = await this.sourcesService.getSourceById(
        targetId as SourceId,
      );

      if (!source) {
        throw new InvalidComplaintError(
          `Source with ID ${targetId} not found`,
          { targetType, targetId },
        );
      }
    } else if (targetType === ComplaintTargetType.POST) {
      const post = await this.rawPostsService.getRawPostById(
        targetId as RawPostId,
      );

      if (!post) {
        throw new InvalidComplaintError(`Post with ID ${targetId} not found`, {
          targetType,
          targetId,
        });
      }
    } else {
      // This should never happen due to TypeScript exhaustiveness checking
      // but we handle it for runtime safety
      throw new InvalidComplaintError(
        `Invalid target type: ${String(targetType)}`,
      );
    }

    this.logger.log(`Target validation passed: ${targetType} ${targetId}`);
  }

  validateReason(reason: ComplaintReason): void {
    if (!Object.values(ComplaintReason).includes(reason)) {
      throw new InvalidComplaintError(`Invalid complaint reason: ${reason}`);
    }
  }

  validateDescription(description?: string): void {
    if (description && description.length > 5000) {
      throw new InvalidComplaintError(
        'Description cannot exceed 5000 characters',
      );
    }
  }
}
