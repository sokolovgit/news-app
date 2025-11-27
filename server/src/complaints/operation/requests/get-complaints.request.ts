import { UserId } from '@/users/domain/schemas';
import { PaginationParams } from '@/commons/types';
import {
  ComplaintStatus,
  ComplaintTargetType,
} from '@/complaints/domain/enums';

export type GetComplaintsRequest = PaginationParams & {
  userId?: UserId;
  status?: ComplaintStatus;
  targetType?: ComplaintTargetType;
  targetId?: string;
  reportedBy?: UserId;
  sort?: {
    field: 'createdAt' | 'updatedAt' | 'status';
    order: 'asc' | 'desc';
  };
};
