import { LoadState } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

type EmailVerificationProperties = {
  id: UserId;
  createdAt?: Date;
  updatedAt?: Date;
};

type EmailVerificationRelations = {
  user: LoadState<User>;
};

export type EmailVerificationLoadOptions = {
  withUser?: boolean;
};

export class EmailVerification {
  private readonly userAccessor = this.relations.user.bindTo(
    this.constructor.name,
    User.name,
  );

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

  getUser(): User | null {
    return this.userAccessor.getOrThrow();
  }
}
