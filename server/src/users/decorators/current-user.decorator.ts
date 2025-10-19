import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    if (ctx.getType() !== 'http') {
      throw new BadRequestException('Invalid protocol');
    }

    const http = ctx.switchToHttp();
    const request = http.getRequest<Request>();

    const user = request.user;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  },
);
