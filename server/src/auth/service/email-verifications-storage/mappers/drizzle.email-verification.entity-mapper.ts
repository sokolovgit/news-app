import { ToEntityMapper, ToSchemaMapper } from '@/commons/database';

import {
  EmailVerificationInsert,
  EmailVerificationSelect,
} from '@/auth/domain/schemas';
import { EmailVerification } from '@/auth/domain/entities';

import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleEmailVerificationEntityMapper
  implements
    ToEntityMapper<EmailVerificationSelect, EmailVerification>,
    ToSchemaMapper<EmailVerification, EmailVerificationInsert>
{
  private userMapper: DrizzleUserEntityMapper;

  constructor() {
    this.userMapper = new DrizzleUserEntityMapper();
  }

  toEntity(
    data: EmailVerificationSelect & { user: UserSelect },
  ): EmailVerification {
    const user = this.userMapper.toEntity(data.user);

    return new EmailVerification(
      {
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      { user },
    );
  }

  toSchema(entity: EmailVerification): EmailVerificationInsert {
    return {
      id: entity.getId(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
