import { LoadState } from '@/commons/types';

import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { Source } from '@/sources/domain/entities';
import { SourceId } from '@/sources/domain/schemas';
import { UserSourceId } from '../schemas';

export type UserSourceProperties = {
  id: UserSourceId;
  userId: UserId;
  sourceId: SourceId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserSourceRelations = {
  user: LoadState<User>;
  source: LoadState<Source>;
};

export type UserSourceLoadOptions = {
  withUser?: boolean;
  withSource?: boolean;
};

export class UserSource {
  private readonly userAccessor = this.relations.user.bindTo(
    this.constructor.name,
    User.name,
  );
  private readonly sourceAccessor = this.relations.source.bindTo(
    this.constructor.name,
    Source.name,
  );

  public constructor(
    private readonly props: UserSourceProperties,
    private readonly relations: UserSourceRelations,
  ) {}

  getId(): UserSourceId {
    return this.props.id;
  }

  getUserId(): UserId {
    return this.props.userId;
  }

  getSourceId(): SourceId {
    return this.props.sourceId;
  }

  getUser(): User | null {
    return this.userAccessor.getOrThrow();
  }

  getSource(): Source | null {
    return this.sourceAccessor.getOrThrow();
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
      userId: this.getUserId(),
      sourceId: this.getSourceId(),
      createdAt: this.getCreatedAt(),
      updatedAt: this.getUpdatedAt(),
    };
  }
}
