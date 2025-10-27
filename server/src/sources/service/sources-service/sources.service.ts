import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourcesRepository } from '../abstracts';
import { SourceId } from '@/sources/domain/schemas';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';

@Injectable()
export class SourcesService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesRepository: SourcesRepository,
  ) {}

  async getSourceById(
    id: SourceId,
    loadOptions: SourceLoadOptions = {},
  ): Promise<Source | null> {
    this.logger.log(
      `Getting source by ID: ${id} with load options: ${JSON.stringify(loadOptions)}`,
    );

    const source = await this.sourcesRepository.getSourceById(id, loadOptions);

    if (!source) {
      this.logger.log(`Source not found with ID: ${id}`);
      return null;
    }

    this.logger.log(`Source found with ID: ${id}`);

    return source;
  }
}
