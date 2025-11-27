import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { PaginatedResult } from '@/commons/types';

import { ComplaintId } from '@/complaints/domain/schemas';
import { Complaint, ComplaintLoadOptions } from '@/complaints/domain/entities';
import {
  ComplaintStatus,
  ComplaintTargetType,
  ComplaintReason,
} from '@/complaints/domain/enums';
import {
  ComplaintNotFoundError,
  InvalidComplaintError,
  DuplicateComplaintError,
} from '@/complaints/domain/errors';
import { ComplaintsRepository, GetComplaintsParams } from '../abstracts';
import { UserId } from '@/users/domain/schemas';
import { ComplaintFactory } from '@/complaints/domain/factories';
import { SourcesService } from '@/sources/service/sources-service';
import { RawPostsService } from '@/posts/service/raw-posts-service';
import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '@/posts/domain/schemas';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly complaintsRepository: ComplaintsRepository,
    private readonly sourcesService: SourcesService,
    private readonly rawPostsService: RawPostsService,
  ) {}

  async getComplaintById(
    id: ComplaintId,
    loadOptions: ComplaintLoadOptions = {},
  ): Promise<Complaint | null> {
    this.logger.log(
      `Getting complaint by ID: ${id} with load options: ${JSON.stringify(loadOptions)}`,
    );

    const complaint = await this.complaintsRepository.getComplaintById(
      id,
      loadOptions,
    );

    if (!complaint) {
      this.logger.log(`Complaint not found with ID: ${id}`);
      return null;
    }

    this.logger.log(`Complaint found with ID: ${id}`);
    return complaint;
  }

  async getComplaintByIdOrThrow(
    id: ComplaintId,
    loadOptions: ComplaintLoadOptions = {},
  ): Promise<Complaint> {
    const complaint = await this.getComplaintById(id, loadOptions);

    if (!complaint) {
      throw new ComplaintNotFoundError(id);
    }

    return complaint;
  }

  async createComplaint(
    targetType: ComplaintTargetType,
    targetId: string,
    reason: ComplaintReason,
    reportedBy: UserId,
    description?: string,
  ): Promise<Complaint> {
    this.logger.log(
      `Creating complaint for ${targetType} ${targetId} by user ${reportedBy}`,
    );

    // Check for duplicate complaint
    const exists = await this.complaintsRepository.existsComplaint(
      targetType,
      targetId,
      reportedBy,
    );

    if (exists) {
      throw new DuplicateComplaintError(targetType, targetId, reportedBy);
    }

    // Validate target exists (basic validation)
    if (!targetId || targetId.trim().length === 0) {
      throw new InvalidComplaintError('Target ID is required');
    }

    const complaint = ComplaintFactory.create(
      targetType,
      targetId,
      reason,
      reportedBy,
      description?.trim() || undefined,
    );

    const savedComplaint = await this.complaintsRepository.save(complaint);

    if (!savedComplaint) {
      this.logger.error(
        `Failed to save complaint for ${targetType} ${targetId}`,
      );
      throw new InvalidComplaintError('Failed to create complaint');
    }

    this.logger.log(`Complaint created with ID: ${savedComplaint.getId()}`);
    return savedComplaint;
  }

  async getComplaints(
    params: GetComplaintsParams,
    loadOptions: ComplaintLoadOptions = {},
  ): Promise<PaginatedResult<Complaint>> {
    this.logger.log(
      `Getting complaints with params: ${JSON.stringify(params)}`,
    );

    return await this.complaintsRepository.getComplaints(params, loadOptions);
  }

  async resolveComplaint(
    complaintId: ComplaintId,
    resolvedBy: UserId,
    resolutionNote?: string,
  ): Promise<Complaint> {
    this.logger.log(`Resolving complaint ${complaintId} by user ${resolvedBy}`);

    const complaint = await this.getComplaintByIdOrThrow(complaintId);

    if (complaint.isResolved() || complaint.isRejected()) {
      throw new InvalidComplaintError(
        'Complaint is already resolved or rejected',
      );
    }

    await this.complaintsRepository.updateStatus(
      complaintId,
      ComplaintStatus.RESOLVED,
      resolvedBy,
      resolutionNote,
    );

    // Take action on the target when complaint is resolved
    await this.handleResolvedComplaint(complaint);

    const updatedComplaint = await this.getComplaintByIdOrThrow(complaintId, {
      withReporter: true,
      withResolver: true,
    });

    this.logger.log(`Complaint ${complaintId} resolved`);
    return updatedComplaint;
  }

  async rejectComplaint(
    complaintId: ComplaintId,
    resolvedBy: UserId,
    resolutionNote?: string,
  ): Promise<Complaint> {
    this.logger.log(`Rejecting complaint ${complaintId} by user ${resolvedBy}`);

    const complaint = await this.getComplaintByIdOrThrow(complaintId);

    if (complaint.isResolved() || complaint.isRejected()) {
      throw new InvalidComplaintError(
        'Complaint is already resolved or rejected',
      );
    }

    await this.complaintsRepository.updateStatus(
      complaintId,
      ComplaintStatus.REJECTED,
      resolvedBy,
      resolutionNote,
    );

    const updatedComplaint = await this.getComplaintByIdOrThrow(complaintId, {
      withReporter: true,
      withResolver: true,
    });

    this.logger.log(`Complaint ${complaintId} rejected`);
    return updatedComplaint;
  }

  async reviewComplaint(complaintId: ComplaintId): Promise<Complaint> {
    this.logger.log(`Marking complaint ${complaintId} as reviewed`);

    const complaint = await this.getComplaintByIdOrThrow(complaintId);

    if (complaint.getStatus() !== ComplaintStatus.PENDING) {
      throw new InvalidComplaintError(
        'Only pending complaints can be marked as reviewed',
      );
    }

    await this.complaintsRepository.updateStatus(
      complaintId,
      ComplaintStatus.REVIEWED,
    );

    const updatedComplaint = await this.getComplaintByIdOrThrow(complaintId, {
      withReporter: true,
    });

    this.logger.log(`Complaint ${complaintId} marked as reviewed`);
    return updatedComplaint;
  }

  /**
   * Handle actions when a complaint is resolved (accepted)
   * - Bans sources if complaint is about a source (sets isBanned = true)
   * - Bans posts if complaint is about a post (sets isBanned = true)
   */
  private async handleResolvedComplaint(complaint: Complaint): Promise<void> {
    const targetType = complaint.getTargetType();
    const targetId = complaint.getTargetId();

    if (targetType === ComplaintTargetType.SOURCE) {
      try {
        await this.sourcesService.updateMetadata(targetId as SourceId, {
          isBanned: true,
          lastError: `Source banned due to resolved complaint: ${complaint.getReason()}`,
        });

        this.logger.log(
          `Source ${targetId} banned due to resolved complaint ${complaint.getId()}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to ban source ${targetId} after complaint resolution: ${error}`,
        );
        // Don't throw - complaint is already resolved, just log the error
      }
    } else if (targetType === ComplaintTargetType.POST) {
      try {
        await this.rawPostsService.banPost(targetId as RawPostId);

        this.logger.log(
          `Post ${targetId} banned due to resolved complaint ${complaint.getId()}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to ban post ${targetId} after complaint resolution: ${error}`,
        );
        // Don't throw - complaint is already resolved, just log the error
      }
    }
  }
}
