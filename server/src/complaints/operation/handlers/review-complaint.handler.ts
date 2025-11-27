import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ComplaintsService } from '@/complaints/service/complaints-service';

import { ReviewComplaintRequest } from '../requests';
import { ReviewComplaintResponse } from '../responses';

@Injectable()
export class ReviewComplaintHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly complaintsService: ComplaintsService,
  ) {}

  async handle(
    request: ReviewComplaintRequest,
  ): Promise<ReviewComplaintResponse> {
    const process = 'review-complaint';
    const processId = this.logger.startProcess(process, {
      complaintId: request.complaintId,
    });

    this.logger.logProcessProgress(
      processId,
      process,
      'Marking complaint as reviewed',
    );

    const complaint = await this.complaintsService.reviewComplaint(
      request.complaintId,
    );

    this.logger.logProcessProgress(
      processId,
      process,
      'Complaint marked as reviewed',
      {
        complaintId: complaint.getId(),
      },
    );

    return { complaint };
  }
}
