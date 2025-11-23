import { LoadState } from '@/commons/types';
import { PublicSource, SourceStatus } from '../enums';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '../schemas';

export type SourceProperties = {
  id: SourceId;
  addedBy?: UserId;
  source: PublicSource;
  name: string;
  url: string;
  lastFetchedAt?: Date;
  cursor?: string;
  lastError?: string;
  status?: SourceStatus;
  fetchMetadata?: Record<string, unknown>;
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

  getSource(): PublicSource {
    return this.props.source;
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

  getCursor(): string | undefined {
    return this.props.cursor;
  }

  getLastError(): string | undefined {
    return this.props.lastError;
  }

  getStatus(): SourceStatus {
    return this.props.status ?? SourceStatus.ACTIVE;
  }

  getFetchMetadata(): Record<string, unknown> | undefined {
    return this.props.fetchMetadata;
  }

  isActive(): boolean {
    return this.getStatus() === SourceStatus.ACTIVE;
  }

  isPaused(): boolean {
    return this.getStatus() === SourceStatus.PAUSED;
  }

  hasError(): boolean {
    return this.getStatus() === SourceStatus.ERROR;
  }

  toJSON() {
    return {
      id: this.getId(),
      addedBy: this.getUserAddedById(),
      source: this.getSource(),
      name: this.getName(),
      url: this.getUrl(),
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
