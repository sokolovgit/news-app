import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ComplaintsService } from '@/complaints/service/complaints-service';

import { RejectComplaintRequest } from '../requests';
import { RejectComplaintResponse } from '../responses';

@Injectable()
export class RejectComplaintHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly complaintsService: ComplaintsService,
  ) {}

  async handle(
    request: RejectComplaintRequest,
  ): Promise<RejectComplaintResponse> {
    const process = 'reject-complaint';
    const processId = this.logger.startProcess(process, {
      complaintId: request.complaintId,
      resolvedBy: request.resolvedBy,
    });

    this.logger.logProcessProgress(processId, process, 'Rejecting complaint');

    const complaint = await this.complaintsService.rejectComplaint(
      request.complaintId,
      request.resolvedBy,
      request.resolutionNote,
    );

    this.logger.logProcessProgress(processId, process, 'Complaint rejected', {
      complaintId: complaint.getId(),
    });

    return { complaint };
  }
}
