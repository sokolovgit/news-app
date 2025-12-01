import { PaginationParams } from '@/commons/types';

export type GetAllUsersRequest = PaginationParams & {
  userId?: string;
  search?: string;
  sortField?: 'createdAt' | 'email';
  sortOrder?: 'asc' | 'desc';
};
