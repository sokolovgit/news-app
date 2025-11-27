import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ComplaintsService } from '@/complaints/service/complaints-service';

import { GetComplaintsRequest } from '../requests';
import { GetComplaintsResponse } from '../responses';

@Injectable()
export class GetComplaintsHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly complaintsService: ComplaintsService,
  ) {}

  async handle(request: GetComplaintsRequest): Promise<GetComplaintsResponse> {
    const process = 'get-complaints';
    const processId = this.logger.startProcess(process, {
      userId: request.userId,
      status: request.status,
      targetType: request.targetType,
      offset: request.offset,
      limit: request.limit,
    });

    this.logger.logProcessProgress(processId, process, 'Fetching complaints');

    const result = await this.complaintsService.getComplaints(
      {
        status: request.status,
        targetType: request.targetType,
        targetId: request.targetId,
        reportedBy: request.reportedBy,
        offset: request.offset,
        limit: request.limit,
        sort: request.sort,
      },
      {
        withReporter: true,
        withResolver: true,
      },
    );

    this.logger.logProcessProgress(processId, process, 'Complaints retrieved', {
      total: result.total,
      returned: result.data.length,
    });

    return result;
  }
}
