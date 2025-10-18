import { UserId } from '@/users/domain/schemas';
import { RefreshTokenId } from '../schemas';
import { User } from '@/users/domain/entities';

export type RefreshTokenProperties = {
  id: RefreshTokenId;
  userId: UserId;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RefreshTokenRelations = {
  user: User;
};

export class RefreshToken {
  public constructor(
    private readonly props: RefreshTokenProperties,
    private readonly relations: RefreshTokenRelations,
  ) {}

  getId(): RefreshTokenId {
    return this.props.id;
  }
  getUserId(): UserId {
    return this.props.userId;
  }
  getToken(): string {
    return this.props.token;
  }
  getExpiresAt(): Date {
    return this.props.expiresAt;
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
