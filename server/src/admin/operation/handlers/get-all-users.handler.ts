import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/logger';
import { AdminService } from '../../service/admin-service/admin.service';

import { PaginatedResult } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { GetAllUsersRequest } from '../requests';

@Injectable()
export class GetAllUsersHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly adminService: AdminService,
  ) {}

  async handle(request: GetAllUsersRequest): Promise<PaginatedResult<User>> {
    this.logger.log(`Getting all users: ${JSON.stringify(request)}`);

    return this.adminService.getAllUsers(
      {
        offset: request.offset,
        limit: request.limit,
      },
      {
        search: request.search,
        sortField: request.sortField,
        sortOrder: request.sortOrder,
      },
    );
  }
}

