import { UserId } from '@/users/domain/schemas';
import { OAuthAccountId } from '../schemas';
import { OAuthProviders } from '../enums';

export type OAuthAccountProperties = {
  id?: OAuthAccountId;
  userId: UserId;
  provider: OAuthProviders;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export class OAuthAccount {
  public constructor(private readonly props: OAuthAccountProperties) {}

  getId(): OAuthAccountId | undefined {
    return this.props.id;
  }

  getUserId(): UserId {
    return this.props.userId;
  }

  getProvider(): OAuthProviders {
    return this.props.provider;
  }

  getProviderId(): string {
    return this.props.providerId;
  }

  getAccessToken(): string | undefined {
    return this.props.accessToken;
  }

  getRefreshToken(): string | undefined {
    return this.props.refreshToken;
  }

  getExpiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
