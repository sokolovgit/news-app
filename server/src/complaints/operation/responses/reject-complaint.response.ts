import { Complaint } from '@/complaints/domain/entities';

export type RejectComplaintResponse = {
  complaint: Complaint;
};
