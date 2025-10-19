import { Logger } from 'drizzle-orm';
import { LoggerService } from '@/logger';

export class DrizzleLogger implements Logger {
  constructor(private readonly logger: LoggerService) {}

  logQuery(query: string, params: unknown[]): void {
    const formattedQuery = query.replace(/\s+/g, ' ').trim();

    this.logger.debug(
      `Query: ${formattedQuery} -- params: ${JSON.stringify(params)}`,
      'DrizzleORM',
    );
  }
}
