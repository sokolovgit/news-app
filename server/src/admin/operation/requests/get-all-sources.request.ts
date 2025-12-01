import { PaginationParams } from '@/commons/types';
import { PublicSource } from '@/sources/domain/enums';

export type GetAllSourcesRequest = PaginationParams & {
  search?: string;
  sourceType?: PublicSource;
};

