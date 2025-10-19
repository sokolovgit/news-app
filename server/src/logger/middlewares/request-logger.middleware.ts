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

    // Capture response body
    let responseBody: unknown;
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    // Override res.send to capture the response
    res.send = function (body?: unknown): Response {
      responseBody = body;
      return originalSend(body);
    };

    // Override res.json to capture the response
    res.json = function (body?: unknown): Response {
      responseBody = body;
      return originalJson(body);
    };

    res.on('finish', () => {
      const responseTime = Date.now() - start;

      // Try to parse responseBody if it's a string
      let parsedBody = responseBody;
      if (typeof responseBody === 'string') {
        try {
          parsedBody = JSON.parse(responseBody);
        } catch {
          // Keep as string if it's not valid JSON
          parsedBody = responseBody;
        }
      }

      this.logger.logRequest(req, res, responseTime, parsedBody);
    });

    next();
  }
}
