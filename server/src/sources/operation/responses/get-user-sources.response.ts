import { PaginatedResult } from '@/commons/types';
import { UserSource } from '@/user-sources/domain/entities';

export type GetUserSourcesResponse = PaginatedResult<UserSource>;
