import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ComplaintsService } from '@/complaints/service/complaints-service';

import { ResolveComplaintRequest } from '../requests';
import { ResolveComplaintResponse } from '../responses';

@Injectable()
export class ResolveComplaintHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly complaintsService: ComplaintsService,
  ) {}

  async handle(
    request: ResolveComplaintRequest,
  ): Promise<ResolveComplaintResponse> {
    const process = 'resolve-complaint';
    const processId = this.logger.startProcess(process, {
      complaintId: request.complaintId,
      resolvedBy: request.resolvedBy,
    });

    this.logger.logProcessProgress(processId, process, 'Resolving complaint');

    const complaint = await this.complaintsService.resolveComplaint(
      request.complaintId,
      request.resolvedBy,
      request.resolutionNote,
    );

    this.logger.logProcessProgress(processId, process, 'Complaint resolved', {
      complaintId: complaint.getId(),
    });

    return { complaint };
  }
}
