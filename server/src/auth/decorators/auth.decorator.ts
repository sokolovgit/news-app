import { ApiBearerAuth } from '@nestjs/swagger';
import { applyDecorators, SetMetadata } from '@nestjs/common';

import { UserRole } from '@/users/domain/enums';
import { AuthMetadata } from '../guards/types';

export const AUTH_METADATA_KEY = 'domains:auth:auth-metadata';

export const Auth = (roles: UserRole[] = [UserRole.USER]) => {
  const metadata: AuthMetadata = { roles };

  return applyDecorators(
    ApiBearerAuth(),
    SetMetadata(AUTH_METADATA_KEY, metadata),
  );
};
