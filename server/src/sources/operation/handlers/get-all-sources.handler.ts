import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourcesService } from '@/sources/service/sources-service';
import { UserSourcesService } from '@/user-sources';
import { createPaginatedResult } from '@/commons/types';

import { GetAllSourcesRequest } from '../requests';
import {
  GetAllSourcesResponse,
  SourceWithSubscriptionStatus,
} from '../responses';

@Injectable()
export class GetAllSourcesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly userSourcesService: UserSourcesService,
  ) {}

  async handle(request: GetAllSourcesRequest): Promise<GetAllSourcesResponse> {
    this.logger.log(
      `Handling get all sources request for user ${request.userId}, offset=${request.pagination.offset}, limit=${request.pagination.limit}`,
    );

    if (request.filters) {
      this.logger.log(
        `Filters: search=${request.filters.search}, sourceType=${request.filters.sourceType}`,
      );
    }

    // Get all sources paginated with filters
    const paginatedSources = await this.sourcesService.findAllPaginatedFiltered(
      request.pagination,
      request.filters,
    );

    // Get all source IDs that the user is subscribed to
    const subscribedSourceIds =
      await this.userSourcesService.getAllSourceIdsByUser(request.userId);

    const subscribedSourceIdsSet = new Set(subscribedSourceIds);

    // Map sources with subscription status
    const sourcesWithStatus: SourceWithSubscriptionStatus[] =
      paginatedSources.data.map((source) => ({
        source,
        isSubscribed: subscribedSourceIdsSet.has(source.getId()),
      }));

    return createPaginatedResult(
      sourcesWithStatus,
      paginatedSources.total,
      request.pagination,
    );
  }
}
