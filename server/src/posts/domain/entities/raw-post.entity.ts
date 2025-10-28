import { LoadState } from '@/commons/types';
import { Source } from '@/sources/domain/entities';
import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '../schemas';
import { Content } from '../types';

export type RawPostProperties = {
  id: RawPostId;
  source: SourceId;
  externalId: string;
  title?: string;
  content: Content;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RawPostRelations = {
  source: LoadState<Source>;
};

export type RawPostLoadOptions = {
  withSource?: boolean;
};

export class RawPost {
  private readonly sourceAccessor = this.relations.source.bindTo(
    this.constructor.name,
    Source.name,
  );

  public constructor(
    private readonly props: RawPostProperties,
    private readonly relations: RawPostRelations,
  ) {}

  getId(): RawPostId {
    return this.props.id;
  }

  getSourceId(): SourceId {
    return this.props.source;
  }

  getSource(): Source | null {
    return this.sourceAccessor.getOrThrow();
  }

  getExternalId(): string {
    return this.props.externalId;
  }

  getTitle(): string | undefined {
    return this.props.title;
  }

  getContent(): Content {
    return this.props.content;
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
      source: this.getSourceId(),
      externalId: this.getExternalId(),
      title: this.getTitle(),
      content: this.getContent(),
      createdAt: this.getCreatedAt(),
      updatedAt: this.getUpdatedAt(),
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
