import { PaginatedResult } from '@/commons/types';
import { Complaint } from '@/complaints/domain/entities';

export type GetComplaintsResponse = PaginatedResult<Complaint>;
