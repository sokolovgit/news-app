import { loadRelation } from '@/commons/database';
import { Complaint, ComplaintLoadOptions } from '@/complaints/domain/entities';
import { ComplaintInsert, ComplaintSelect } from '@/complaints/domain/schemas';
import { ComplaintProperties } from '@/complaints/domain/types';
import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleComplaintsEntityMapper {
  static toEntity(
    data: ComplaintSelect & {
      reporter?: UserSelect | null;
      resolver?: UserSelect | null;
    },
    loadOptions: ComplaintLoadOptions = {},
  ): Complaint {
    const reporterEntity = data.reporter;
    const resolverEntity = data.resolver;

    return new Complaint(
      {
        id: data.id,
        targetType: data.targetType as ComplaintProperties['targetType'],
        targetId: data.targetId as ComplaintProperties['targetId'],
        reason: data.reason as ComplaintProperties['reason'],
        description: data.description ?? undefined,
        status: data.status as ComplaintProperties['status'],
        reportedBy: data.reportedBy,
        resolvedBy: data.resolvedBy ?? undefined,
        resolvedAt: data.resolvedAt ?? undefined,
        resolutionNote: data.resolutionNote ?? undefined,
        createdAt: data.createdAt ?? undefined,
        updatedAt: data.updatedAt ?? undefined,
      },
      {
        reporter: loadRelation(
          loadOptions.withReporter,
          reporterEntity,
          (reporter) => DrizzleUserEntityMapper.toEntity(reporter),
        ),
        resolver: loadRelation(
          loadOptions.withResolver,
          resolverEntity,
          (resolver) => DrizzleUserEntityMapper.toEntity(resolver),
        ),
      },
    );
  }

  static toSchema(entity: Complaint): ComplaintInsert {
    return {
      id: entity.getId(),
      targetType: entity.getTargetType(),
      targetId: entity.getTargetId(),
      reason: entity.getReason(),
      description: entity.getDescription(),
      status: entity.getStatus(),
      reportedBy: entity.getReportedBy(),
      resolvedBy: entity.getResolvedBy(),
      resolvedAt: entity.getResolvedAt(),
      resolutionNote: entity.getResolutionNote(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
