import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Log incoming request
    this.logger.logIncomingRequest(req);

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      this.logger.logRequest(req, res, responseTime);
    });

    next();
  }
}
