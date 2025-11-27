import { UserId } from '@/users/domain/schemas';
import { ComplaintId } from '@/complaints/domain/schemas';

export type ResolveComplaintRequest = {
  complaintId: ComplaintId;
  resolvedBy: UserId;
  resolutionNote?: string;
};
