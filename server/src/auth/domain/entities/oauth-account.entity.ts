import { UserId } from '@/users/domain/schemas';
import { User } from '@/users/domain/entities';
import { OAuthProvider } from '../enums';
import { OAuthAccountId } from '../schemas';
import { LoadState } from '@/commons/types';

type OAuthAccountProperties = {
  id?: OAuthAccountId;
  userId: UserId;
  provider: OAuthProvider;
  providerId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type OAuthAccountRelations = {
  user: LoadState<User>;
};

export type OAuthAccountLoadOptions = {
  withUser?: boolean;
};

export class OAuthAccount {
  private readonly userAccessor = this.relations.user.bindTo(
    this.constructor.name,
    User.name,
  );

  public constructor(
    private readonly props: OAuthAccountProperties,
    private readonly relations: OAuthAccountRelations,
  ) {}

  getId(): OAuthAccountId | undefined {
    return this.props.id;
  }

  getUserId(): UserId {
    return this.props.userId;
  }

  getProvider(): OAuthProvider {
    return this.props.provider;
  }

  getProviderId(): string {
    return this.props.providerId;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  getUser(): User | null {
    return this.userAccessor.getOrThrow();
  }
}
