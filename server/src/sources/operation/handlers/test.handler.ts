import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourcesService } from '@/sources/service/sources-service';
import { SourcesCollectorService } from '@/sources/service/source-collector-service';
import { SourceId } from '@/sources/domain/schemas';
import { SourceNotFoundError } from '@/sources/domain/errors';

@Injectable()
export class TestHandler {
  constructor(
    private readonly sourcesService: SourcesService,
    private readonly logger: LoggerService,
    private readonly sourceCollectorService: SourcesCollectorService,
  ) {}

  async handle() {
    const sourceId = 'bab53d76-b551-45b5-9970-96fa8f048762' as SourceId;

    const source = await this.sourcesService.getSourceById(sourceId);

    if (!source) {
      throw new SourceNotFoundError(sourceId);
    }

    await this.sourceCollectorService.collect(source);

    return { message: 'Source collected' };
  }
}
