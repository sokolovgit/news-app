import { Article } from '@/articles/domain/entities';
import { PaginatedResult } from '@/commons/types';

export type GetArticlesResponse = PaginatedResult<Article>;
