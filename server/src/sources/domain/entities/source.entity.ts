import { LoadState } from '@/commons/types';
import { SourceCollectors, Sources } from '../enums';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '../schemas';

export type SourceProperties = {
  id: SourceId;
  addedBy?: UserId;
  sourceType: Sources;
  collectorType: SourceCollectors;
  name: string;
  url: string;
  lastFetchedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SourceRelations = {
  addedBy: LoadState<User>;
};

export type SourceLoadOptions = {
  withAddedBy?: boolean;
};

export class Source {
  private readonly addedByAccessor = this.relations.addedBy.bindTo(
    this.constructor.name,
    User.name,
  );

  public constructor(
    private readonly props: SourceProperties,
    private readonly relations: SourceRelations,
  ) {}

  getId(): SourceId {
    return this.props.id;
  }

  getUserAddedById(): UserId | undefined {
    return this.props.addedBy;
  }

  getUserAddedBy(): User | null {
    return this.addedByAccessor.getOrThrow();
  }

  getSourceType(): Sources {
    return this.props.sourceType;
  }

  getCollectorType(): SourceCollectors {
    return this.props.collectorType;
  }

  getName(): string {
    return this.props.name;
  }

  getUrl(): string {
    return this.props.url;
  }

  getLastFetchedAt(): Date | undefined {
    return this.props.lastFetchedAt;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
