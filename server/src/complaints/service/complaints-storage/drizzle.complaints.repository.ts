import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, asc, SQL, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import { ComplaintsRepository, GetComplaintsParams } from '../abstracts';
import { DrizzleComplaintsEntityMapper } from './mappers';
import {
  createPaginatedResult,
  PaginatedResult,
  SortOrder,
} from '@/commons/types';

import { ComplaintId, complaints } from '@/complaints/domain/schemas';
import { Complaint, ComplaintLoadOptions } from '@/complaints/domain/entities';
import {
  ComplaintStatus,
  ComplaintTargetType,
} from '@/complaints/domain/enums';
import { UserId } from '@/users/domain/schemas';
import { ComplaintsSortField } from '../abstracts';

@Injectable()
export class DrizzleComplaintsRepository extends ComplaintsRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION) private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async getComplaintById(
    id: ComplaintId,
    relations: ComplaintLoadOptions = {},
  ): Promise<Complaint | null> {
    const complaint = await this.db.query.complaints.findFirst({
      where: eq(complaints.id, id),
      with: this.buildRelations(relations),
    });

    return complaint
      ? DrizzleComplaintsEntityMapper.toEntity(complaint, relations)
      : null;
  }

  async save(complaint: Complaint): Promise<Complaint | null> {
    const complaintData = DrizzleComplaintsEntityMapper.toSchema(complaint);

    const [savedComplaint] = await this.db
      .insert(complaints)
      .values(complaintData)
      .returning();

    if (!savedComplaint) {
      return null;
    }

    // Reload with relations if needed
    const reloadedComplaint = await this.getComplaintById(savedComplaint.id, {
      withReporter: true,
    });

    return reloadedComplaint;
  }

  async getComplaints(
    params: GetComplaintsParams,
    loadOptions: ComplaintLoadOptions = {},
  ): Promise<PaginatedResult<Complaint>> {
    const conditions = [];

    if (params.status) {
      conditions.push(eq(complaints.status, params.status));
    }

    if (params.targetType) {
      conditions.push(eq(complaints.targetType, params.targetType));
    }

    if (params.targetId) {
      conditions.push(eq(complaints.targetId, params.targetId));
    }

    if (params.reportedBy) {
      conditions.push(eq(complaints.reportedBy, params.reportedBy));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortField = params.sort?.field
      ? this.getSortField(params.sort.field)
      : undefined;

    let orderByClause: SQL[] | undefined = undefined;

    if (params.sort?.order && sortField) {
      orderByClause = [
        params.sort.order === SortOrder.ASC ? asc(sortField) : desc(sortField),
      ];
    } else {
      orderByClause = [desc(complaints.createdAt)];
    }

    const complaintsData = await this.db.query.complaints.findMany({
      where: whereClause,
      orderBy: orderByClause,
      with: this.buildRelations(loadOptions),
      limit: params.limit,
      offset: params.offset,
      extras: {
        total: sql<number>`count(*) over()`.as('total'),
      },
    });

    const total = complaintsData[0]?.total ?? 0;

    const complaintEntities = complaintsData.map((complaint) =>
      DrizzleComplaintsEntityMapper.toEntity(complaint, loadOptions),
    );

    return createPaginatedResult(complaintEntities, total, {
      offset: params.offset,
      limit: params.limit,
    });
  }

  async existsComplaint(
    targetType: ComplaintTargetType,
    targetId: string,
    reportedBy: UserId,
  ): Promise<boolean> {
    const existing = await this.db.query.complaints.findFirst({
      where: and(
        eq(complaints.targetType, targetType),
        eq(complaints.targetId, targetId),
        eq(complaints.reportedBy, reportedBy),
      ),
    });

    return !!existing;
  }

  async updateStatus(
    complaintId: ComplaintId,
    status: ComplaintStatus,
    resolvedBy?: UserId,
    resolutionNote?: string,
  ): Promise<void> {
    await this.db
      .update(complaints)
      .set({
        status,
        resolvedBy: resolvedBy ?? null,
        resolvedAt:
          status === ComplaintStatus.RESOLVED ||
          status === ComplaintStatus.REJECTED
            ? new Date()
            : null,
        resolutionNote: resolutionNote ?? null,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId));
  }

  private getSortField(
    field: ComplaintsSortField,
  ):
    | typeof complaints.createdAt
    | typeof complaints.updatedAt
    | typeof complaints.status {
    switch (field) {
      case 'createdAt':
        return complaints.createdAt;
      case 'updatedAt':
        return complaints.updatedAt;
      case 'status':
        return complaints.status;
      default:
        return complaints.createdAt;
    }
  }

  private buildRelations(relations?: ComplaintLoadOptions) {
    return {
      ...(relations?.withReporter && { reporter: true }),
      ...(relations?.withResolver && { resolver: true }),
    } as Record<string, boolean | undefined>;
  }
}
