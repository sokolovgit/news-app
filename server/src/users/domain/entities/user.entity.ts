import { LoadState } from '@/commons/types';
import {
  RefreshToken,
  OAuthAccount,
  EmailVerification,
} from '@/auth/domain/entities';
import { UserId } from '../schemas';
import { UserRole } from '../enums';

export type UserProperties = {
  id: UserId;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserRelations = {
  emailVerification: LoadState<EmailVerification>;
  oauthAccounts: LoadState<OAuthAccount[]>;
  refreshToken: LoadState<RefreshToken>;
};

export type UserLoadOptions = {
  withEmailVerification?: boolean;
  withOAuthAccounts?: boolean;
  withRefreshToken?: boolean;
};

export class User {
  private readonly emailVerificationAccessor =
    this.relations.emailVerification.bindTo(
      this.constructor.name,
      EmailVerification.name,
    );
  private readonly oauthAccountsAccessor = this.relations.oauthAccounts.bindTo(
    this.constructor.name,
    OAuthAccount.name,
  );
  private readonly refreshTokenAccessor = this.relations.refreshToken.bindTo(
    this.constructor.name,
    RefreshToken.name,
  );

  public constructor(
    private readonly props: UserProperties,
    private readonly relations: UserRelations,
  ) {}

  getId(): UserId {
    return this.props.id;
  }

  getEmail(): string {
    return this.props.email;
  }

  getRoles(): UserRole[] {
    return [...this.props.roles];
  }

  hasRole(role: UserRole): boolean {
    return this.props.roles.includes(role);
  }

  getHashedPassword(): string | undefined {
    return this.props.password;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  getEmailVerification(): EmailVerification | null {
    return this.emailVerificationAccessor.getOrThrow();
  }

  getOAuthAccounts(): OAuthAccount[] | null {
    return this.oauthAccountsAccessor.getOrThrow();
  }

  getRefreshToken(): RefreshToken | null {
    return this.refreshTokenAccessor.getOrThrow();
  }

  isEmailVerified(): boolean {
    return this.getEmailVerification() !== null;
  }

  hasOAuthAccounts(): boolean {
    const oauthAccounts = this.getOAuthAccounts();
    return oauthAccounts !== null && oauthAccounts.length > 0;
  }

  hasEmailVerificationLoaded(): boolean {
    return this.emailVerificationAccessor.isLoaded();
  }

  hasOAuthAccountsLoaded(): boolean {
    return this.oauthAccountsAccessor.isLoaded();
  }

  hasRefreshTokenLoaded(): boolean {
    return this.refreshTokenAccessor.isLoaded();
  }

  toString(): string {
    return JSON.stringify(this, null, 2);
  }
}
