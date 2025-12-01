import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/logger';
import { AdminService } from '../../service/admin-service/admin.service';

import { PaginatedResult } from '@/commons/types';
import { Source } from '@/sources/domain/entities';
import { GetAllSourcesRequest } from '../requests';

@Injectable()
export class GetAllSourcesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly adminService: AdminService,
  ) {}

  async handle(
    request: GetAllSourcesRequest,
  ): Promise<PaginatedResult<Source>> {
    this.logger.log(`Getting all sources: ${JSON.stringify(request)}`);

    return this.adminService.getAllSourcesPaginated(
      {
        offset: request.offset,
        limit: request.limit,
      },
      {
        search: request.search,
        sourceType: request.sourceType,
      },
    );
  }
}

