import { UserId } from '@/users/domain/schemas';
import {
  ComplaintTargetType,
  ComplaintReason,
} from '@/complaints/domain/enums';

export type CreateComplaintRequest = {
  userId: UserId;
  targetType: ComplaintTargetType;
  targetId: string;
  reason: ComplaintReason;
  description?: string;
};
