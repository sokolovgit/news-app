import { ComplaintId } from '../schemas';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '@/posts/domain/schemas';
import {
  ComplaintStatus,
  ComplaintReason,
  ComplaintTargetType,
} from '../enums';

export type ComplaintProperties = {
  id: ComplaintId;
  targetType: ComplaintTargetType;
  targetId: SourceId | RawPostId;
  reason: ComplaintReason;
  description?: string;
  status: ComplaintStatus;
  reportedBy: UserId;
  resolvedBy?: UserId;
  resolvedAt?: Date;
  resolutionNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
