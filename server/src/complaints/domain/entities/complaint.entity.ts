import { LoadState } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import {
  ComplaintStatus,
  ComplaintReason,
  ComplaintTargetType,
} from '../enums';
import { ComplaintId } from '../schemas';
import { ComplaintProperties } from '../types';

export type ComplaintRelations = {
  reporter: LoadState<User>;
  resolver: LoadState<User>;
};

export type ComplaintLoadOptions = {
  withReporter?: boolean;
  withResolver?: boolean;
};

export class Complaint {
  private readonly reporterAccessor = this.relations.reporter.bindTo(
    this.constructor.name,
    User.name,
  );

  private readonly resolverAccessor = this.relations.resolver.bindTo(
    this.constructor.name,
    User.name,
  );

  public constructor(
    private readonly props: ComplaintProperties,
    private readonly relations: ComplaintRelations,
  ) {}

  getId(): ComplaintId {
    return this.props.id;
  }

  getTargetType(): ComplaintTargetType {
    return this.props.targetType;
  }

  getTargetId(): string {
    return this.props.targetId;
  }

  getReason(): ComplaintReason {
    return this.props.reason;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  getStatus(): ComplaintStatus {
    return this.props.status;
  }

  getReportedBy(): UserId {
    return this.props.reportedBy;
  }

  getReporter(): User | null {
    return this.reporterAccessor.getOrThrow();
  }

  getResolvedBy(): UserId | undefined {
    return this.props.resolvedBy;
  }

  getResolver(): User | null {
    return this.resolverAccessor.getOrThrow();
  }

  getResolvedAt(): Date | undefined {
    return this.props.resolvedAt;
  }

  getResolutionNote(): string | undefined {
    return this.props.resolutionNote;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  isPending(): boolean {
    return this.props.status === ComplaintStatus.PENDING;
  }

  isResolved(): boolean {
    return this.props.status === ComplaintStatus.RESOLVED;
  }

  isRejected(): boolean {
    return this.props.status === ComplaintStatus.REJECTED;
  }

  toJSON() {
    return {
      id: this.getId(),
      targetType: this.getTargetType(),
      targetId: this.getTargetId(),
      reason: this.getReason(),
      description: this.getDescription(),
      status: this.getStatus(),
      reportedBy: this.getReportedBy(),
      resolvedBy: this.getResolvedBy(),
      resolvedAt: this.getResolvedAt(),
      resolutionNote: this.getResolutionNote(),
      createdAt: this.getCreatedAt(),
      updatedAt: this.getUpdatedAt(),
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
