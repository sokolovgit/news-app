import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

type EmailVerificationProperties = {
  id: UserId;
  createdAt?: Date;
  updatedAt?: Date;
};

type EmailVerificationRelations = {
  user: User;
};

export class EmailVerification {
  public constructor(
    private readonly props: EmailVerificationProperties,
    private readonly relations: EmailVerificationRelations,
  ) {}

  getId(): UserId {
    return this.props.id;
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
