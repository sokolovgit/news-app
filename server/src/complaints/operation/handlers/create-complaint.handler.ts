import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ComplaintsService } from '@/complaints/service/complaints-service';
import { ComplaintsValidationService } from '@/complaints/service/complaints-validation';

import { CreateComplaintRequest } from '../requests';
import { CreateComplaintResponse } from '../responses';

@Injectable()
export class CreateComplaintHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly complaintsService: ComplaintsService,
    private readonly complaintsValidationService: ComplaintsValidationService,
  ) {}

  async handle(
    request: CreateComplaintRequest,
  ): Promise<CreateComplaintResponse> {
    const process = 'create-complaint';
    const processId = this.logger.startProcess(process, {
      userId: request.userId,
      targetType: request.targetType,
      targetId: request.targetId,
    });

    this.logger.logProcessProgress(
      processId,
      process,
      'Validating complaint data',
    );

    this.complaintsValidationService.validateReason(request.reason);
    this.complaintsValidationService.validateDescription(request.description);
    await this.complaintsValidationService.validateTarget(
      request.targetType,
      request.targetId,
    );

    this.logger.logProcessProgress(processId, process, 'Creating complaint');

    const complaint = await this.complaintsService.createComplaint(
      request.targetType,
      request.targetId,
      request.reason,
      request.userId,
      request.description,
    );

    this.logger.logProcessProgress(processId, process, 'Complaint created', {
      complaintId: complaint.getId(),
    });

    return { complaint };
  }
}
