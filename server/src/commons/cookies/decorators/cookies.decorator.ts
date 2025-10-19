import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (typeof data === 'string' && data.length > 0) {
      return request.cookies &&
        typeof request.cookies === 'object' &&
        data in request.cookies
        ? String(request.cookies[data])
        : undefined;
    }

    return request.cookies && typeof request.cookies === 'object'
      ? Object.fromEntries(
          Object.entries(request.cookies).map(([k, v]) => [k, String(v)]),
        )
      : undefined;
  },
);
