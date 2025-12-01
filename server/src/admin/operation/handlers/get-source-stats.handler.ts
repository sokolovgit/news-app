import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/logger';
import {
  AdminService,
  SourceStats,
} from '../../service/admin-service/admin.service';

@Injectable()
export class GetSourceStatsHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly adminService: AdminService,
  ) {}

  async handle(): Promise<SourceStats> {
    this.logger.log('Getting source statistics');

    return this.adminService.getSourceStats();
  }
}

