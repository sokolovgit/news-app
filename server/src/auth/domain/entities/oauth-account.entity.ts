import { UserId } from '@/users/domain/schemas';
import { User } from '@/users/domain/entities';
import { OAuthProvider } from '../enums';
import { OAuthAccountId } from '../schemas';

type OAuthAccountProperties = {
  id?: OAuthAccountId;
  userId: UserId;
  provider: OAuthProvider;
  providerId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type OAuthAccountRelations = {
  user: User;
};

export class OAuthAccount {
  public constructor(
    private readonly props: OAuthAccountProperties,
    private readonly relations: OAuthAccountRelations,
  ) {
    if (relations.user && relations.user.getId() !== props.userId) {
      throw new Error('User ID mismatch in OAuthAccount');
    }
  }

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

  getUser(): User {
    return this.relations.user;
  }
}
