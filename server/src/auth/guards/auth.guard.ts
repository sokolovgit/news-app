import {
  Inject,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { merge } from 'lodash';

import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';
import { AuthMetadata } from './types';
import { AUTH_METADATA_KEY } from '../decorators/auth.decorator';
import { AuthenticationService } from '../service/authentication';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector.name)
    private readonly reflector: Reflector,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMetadata = this.getAuthMetadataFromContext(context);

    if (!authMetadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const jwt = this.getAccessTokenFromRequest(request);

    if (!jwt) {
      return false;
    }

    const user =
      await this.authenticationService.validateAndGetUserOrThrow(jwt);

    if (!user) {
      return false;
    }

    request.user = user;

    const hasRequiredRoles = this.hasRequiredRoles(
      user,
      authMetadata.roles ?? [],
    );

    if (!hasRequiredRoles) {
      return false;
    }

    return true;
  }

  private getAccessTokenFromRequest(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return undefined;
    }

    const authorizationParts = authorizationHeader.split(' ');
    if (authorizationParts.length !== 2) {
      return undefined;
    }
    const [type, token] = authorizationParts;

    if (type !== 'Bearer') {
      return undefined;
    }

    return token;
  }

  private hasRequiredRoles(user: User, roles: UserRole[]): boolean {
    if (roles.length === 0) {
      return true;
    }

    return roles.every((role) => user.hasRole(role));
  }

  private getAuthMetadataFromContext(
    context: ExecutionContext,
  ): AuthMetadata | null {
    const classAuthMetadata = this.reflector.get<AuthMetadata>(
      AUTH_METADATA_KEY,
      context.getClass(),
    );

    const handlerAuthMetadata = this.reflector.get<AuthMetadata>(
      AUTH_METADATA_KEY,
      context.getHandler(),
    );

    if (classAuthMetadata && handlerAuthMetadata) {
      return merge(classAuthMetadata, handlerAuthMetadata);
    }

    if (classAuthMetadata) {
      return classAuthMetadata;
    }

    if (handlerAuthMetadata) {
      return handlerAuthMetadata;
    }

    return null;
  }
}
