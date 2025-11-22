import { Injectable } from '@nestjs/common';

import { LoadState, PaginatedResult, PaginationParams } from '@/commons/types';
import { uuid } from '@/commons/utils';

import { LoggerService } from '@/logger';
import { SourcesRepository } from '../abstracts';
import { SourceId } from '@/sources/domain/schemas';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';
import { SourceStatus } from '@/sources/domain/enums';
import { CreateSourceProps } from './types';
import { SourceCreationFailedError } from '@/sources/domain/errors';

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

  async getSourceByUrl(
    url: string,
    loadOptions: SourceLoadOptions = {},
  ): Promise<Source | null> {
    this.logger.log(
      `Getting source by URL: ${url} with load options: ${JSON.stringify(loadOptions)}`,
    );

    const source = await this.sourcesRepository.getSourceByUrl(
      url,
      loadOptions,
    );

    if (!source) {
      this.logger.log(`Source not found with URL: ${url}`);
      return null;
    }

    this.logger.log(`Source found with URL: ${url}`);

    return source;
  }

  async createSource(props: CreateSourceProps): Promise<Source> {
    this.logger.log(
      `Creating source for URL ${props.url} of type ${props.source}`,
    );

    const sourceEntity = new Source(
      {
        id: props.id ?? uuid<SourceId>(),
        addedBy: props.addedBy,
        source: props.source,
        name: props.name,
        url: props.url,
        status: props.status ?? SourceStatus.ACTIVE,
      },
      {
        addedBy: LoadState.notLoaded(),
      },
    );

    const savedSource = await this.sourcesRepository.save(sourceEntity);

    if (!savedSource) {
      this.logger.error(
        `Failed to create source for URL ${props.url} - repository returned null`,
      );
      throw new SourceCreationFailedError(props.url, props.source);
    }

    this.logger.log(
      `Source created successfully for URL ${props.url} with ID ${savedSource.getId()}`,
    );

    return savedSource;
  }

  async findAll(loadOptions: SourceLoadOptions = {}): Promise<Source[]> {
    this.logger.debug('Getting all sources');
    return this.sourcesRepository.findAll(loadOptions);
  }

  async findAllPaginated(
    params: PaginationParams,
    loadOptions: SourceLoadOptions = {},
  ): Promise<PaginatedResult<Source>> {
    this.logger.debug(
      `Getting sources paginated: offset=${params.offset}, limit=${params.limit}`,
    );
    return this.sourcesRepository.findAllPaginated(params, loadOptions);
  }

  async updateMetadata(
    sourceId: SourceId,
    metadata: {
      lastFetchedAt?: Date;
      cursor?: string | null;
      lastError?: string | null;
      status?: SourceStatus;
      fetchMetadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    this.logger.debug(
      `Updating metadata for source ${sourceId}: status=${metadata.status}, cursor=${metadata.cursor}`,
    );

    await this.sourcesRepository.updateMetadata(sourceId, metadata);

    this.logger.debug(`Successfully updated metadata for source ${sourceId}`);
  }
}
