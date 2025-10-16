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

export class User {
  public constructor(private readonly props: UserProperties) {}

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

  getPassword(): string | undefined {
    return this.props.password;
  }
  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
