import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/logger';
import { UsersService } from '@/users/service/users-service';
import { SourcesService } from '@/sources/service/sources-service';
import { ArticlesService } from '@/articles/service/articles-service';
import { PaginationParams, PaginatedResult, SortOrder } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { Source } from '@/sources/domain/entities';
import { Article } from '@/articles/domain/entities';
import { PublicSource } from '@/sources/domain/enums';

export interface SourceStats {
  total: number;
  byType: Record<PublicSource, number>;
}

export interface AdminUsersFilter {
  search?: string;
  sortField?: 'createdAt' | 'email';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class AdminService {
  constructor(
    private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly sourcesService: SourcesService,
    private readonly articlesService: ArticlesService,
  ) {}

  async getAllUsers(
    params: PaginationParams,
    filters?: AdminUsersFilter,
  ): Promise<PaginatedResult<User>> {
    this.logger.log(
      `Getting all users with params: ${JSON.stringify(params)}, filters: ${JSON.stringify(filters)}`,
    );

    return this.usersService.getAllUsersPaginated(params, {
      search: filters?.search,
      sortField: filters?.sortField,
      sortOrder: filters?.sortOrder,
    });
  }

  async getSourceStats(): Promise<SourceStats> {
    this.logger.log('Getting source statistics');

    // Get all sources to calculate stats
    const allSources = await this.sourcesService.findAll();

    const stats: SourceStats = {
      total: allSources.length,
      byType: {
        telegram: 0,
        instagram: 0,
        rss: 0,
        twitter: 0,
      },
    };

    allSources.forEach((source) => {
      const sourceType = source.getSource();
      if (stats.byType[sourceType] !== undefined) {
        stats.byType[sourceType]++;
      }
    });

    return stats;
  }

  async getAllSourcesPaginated(
    params: PaginationParams,
    filters?: { search?: string; sourceType?: PublicSource },
  ): Promise<PaginatedResult<Source>> {
    this.logger.log(
      `Getting all sources paginated: ${JSON.stringify(params)}, filters: ${JSON.stringify(filters)}`,
    );

    return this.sourcesService.findAllPaginatedFiltered(params, filters);
  }

  async getAllArticlesPaginated(
    params: PaginationParams,
    filters?: {
      search?: string;
      sortField?: 'createdAt' | 'updatedAt' | 'publishedAt';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<PaginatedResult<Article>> {
    this.logger.log(
      `Getting all articles paginated: ${JSON.stringify(params)}, filters: ${JSON.stringify(filters)}`,
    );

    const sortField = filters?.sortField || 'publishedAt';
    const sortOrder = filters?.sortOrder === 'asc' ? SortOrder.ASC : SortOrder.DESC;

    return this.articlesService.getPublicArticles(
      {
        search: filters?.search,
        sort: {
          field: sortField,
          order: sortOrder,
        },
        offset: params.offset,
        limit: params.limit,
      },
      { withAuthor: true },
    );
  }
}
