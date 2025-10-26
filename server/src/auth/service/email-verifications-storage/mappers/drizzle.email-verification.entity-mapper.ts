import { loadRelation } from '@/commons/database';

import {
  EmailVerificationInsert,
  EmailVerificationSelect,
} from '@/auth/domain/schemas';
import {
  EmailVerification,
  EmailVerificationLoadOptions,
} from '@/auth/domain/entities';

import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleEmailVerificationEntityMapper {
  static toEntity(
    data: EmailVerificationSelect & { user?: UserSelect | null },
    loadOptions: EmailVerificationLoadOptions = {},
  ): EmailVerification {
    return new EmailVerification(
      {
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        user: loadRelation(loadOptions.withUser, data.user, (user) =>
          DrizzleUserEntityMapper.toEntity(user),
        ),
      },
    );
  }

  static toSchema(entity: EmailVerification): EmailVerificationInsert {
    return {
      id: entity.getId(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
