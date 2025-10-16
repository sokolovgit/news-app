import { UserId } from '../schemas';
import { UserRole } from '../enums';
import { uuid } from '@/commons/utils';

export type UserProperties = {
  id?: UserId;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
};

export class User {
  public constructor(private readonly props: UserProperties) {}

  getId(): UserId | undefined {
    return this.props.id ?? uuid<UserId>();
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
