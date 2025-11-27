import { PaginatedResult, PaginationParams } from '@/commons/types';
import { Complaint, ComplaintLoadOptions } from '@/complaints/domain/entities';
import { ComplaintId } from '@/complaints/domain/schemas';
import {
  ComplaintStatus,
  ComplaintTargetType,
} from '@/complaints/domain/enums';
import { UserId } from '@/users/domain/schemas';

export type ComplaintsSortField = 'createdAt' | 'updatedAt' | 'status';

export type GetComplaintsParams = PaginationParams & {
  status?: ComplaintStatus;
  targetType?: ComplaintTargetType;
  targetId?: string;
  reportedBy?: UserId;
  sort?: {
    field: ComplaintsSortField;
    order: 'asc' | 'desc';
  };
};

export abstract class ComplaintsRepository {
  abstract getComplaintById(
    id: ComplaintId,
    relations?: ComplaintLoadOptions,
  ): Promise<Complaint | null>;

  abstract save(complaint: Complaint): Promise<Complaint | null>;

  abstract getComplaints(
    params: GetComplaintsParams,
    loadOptions?: ComplaintLoadOptions,
  ): Promise<PaginatedResult<Complaint>>;

  abstract existsComplaint(
    targetType: ComplaintTargetType,
    targetId: string,
    reportedBy: UserId,
  ): Promise<boolean>;

  abstract updateStatus(
    complaintId: ComplaintId,
    status: ComplaintStatus,
    resolvedBy?: UserId,
    resolutionNote?: string,
  ): Promise<void>;
}
