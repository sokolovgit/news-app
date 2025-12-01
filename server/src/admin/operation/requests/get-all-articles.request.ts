import { PaginationParams } from '@/commons/types';

export type GetAllArticlesRequest = PaginationParams & {
  search?: string;
  sortField?: 'createdAt' | 'updatedAt' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
};

