import { uuid } from '@/commons/utils';
import { LoadState } from '@/commons/types';

import { Complaint } from '../entities';
import { ComplaintProperties } from '../types';
import {
  ComplaintStatus,
  ComplaintTargetType,
  ComplaintReason,
} from '../enums';
import { ComplaintId } from '../schemas';
import { UserId } from '@/users/domain/schemas';
import { User } from '@/users/domain/entities';

export class ComplaintFactory {
  static create(
    targetType: ComplaintTargetType,
    targetId: string,
    reason: ComplaintReason,
    reportedBy: UserId,
    description?: string,
  ): Complaint {
    return new Complaint(
      {
        id: uuid<ComplaintId>(),
        targetType,
        targetId: targetId as ComplaintProperties['targetId'],
        reason,
        description,
        status: ComplaintStatus.PENDING,
        reportedBy,
        resolvedBy: undefined,
        resolvedAt: undefined,
        resolutionNote: undefined,
      },
      {
        reporter: LoadState.notLoaded<User>(),
        resolver: LoadState.notLoaded<User>(),
      },
    );
  }
}
