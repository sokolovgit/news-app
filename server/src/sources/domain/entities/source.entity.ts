import { LoadState } from '@/commons/types';
import { Collector, PublicSource } from '../enums';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '../schemas';

export type SourceProperties = {
  id: SourceId;
  addedBy?: UserId;
  source: PublicSource;
  collector: Collector;
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

  getSource(): PublicSource {
    return this.props.source;
  }

  getCollector(): Collector {
    return this.props.collector;
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

  toJSON() {
    return {
      id: this.getId(),
      addedBy: this.getUserAddedById(),
      source: this.getSource(),
      collector: this.getCollector(),
      name: this.getName(),
      url: this.getUrl(),
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
