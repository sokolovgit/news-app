import { Injectable } from '@nestjs/common';

import { uuid } from '@/commons/utils';
import { LoadState, PaginatedResult, PaginationParams } from '@/commons/types';

import { LoggerService } from '@/logger';
import { UserSourcesRepository, UserSourcesFilterParams } from '../abstracts';

import {
  UserSource,
  UserSourceLoadOptions,
} from '@/user-sources/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';
import { UserSourceId } from '@/user-sources/domain/schemas';
import { UserSourceCreationFailedError } from '@/user-sources/domain/errors';
import { PublicSource } from '@/sources/domain/enums';

import { LinkResult } from './types/link-result.type';

@Injectable()
export class UserSourcesService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userSourcesRepository: UserSourcesRepository,
  ) {}

  async ensureLink(userId: UserId, sourceId: SourceId): Promise<LinkResult> {
    this.logger.debug(
      `Ensuring user ${userId} is linked to source ${sourceId}`,
    );

    const existing = await this.userSourcesRepository.findByUserAndSource(
      userId,
      sourceId,
    );

    if (existing) {
      this.logger.debug(
        `User ${userId} already linked to source ${sourceId} via ${existing.getId()}`,
      );
      return { userSource: existing, created: false };
    }

    const userSource = new UserSource(
      {
        id: uuid<UserSourceId>(),
        userId,
        sourceId,
      },
      {
        user: LoadState.notLoaded(),
        source: LoadState.notLoaded(),
      },
    );

    const saved = await this.userSourcesRepository.save(userSource);

    if (!saved) {
      this.logger.error(
        `Failed to link user ${userId} to source ${sourceId} - repository returned null`,
      );
      throw new UserSourceCreationFailedError(userId, sourceId);
    }

    this.logger.debug(
      `User ${userId} linked to source ${sourceId} via ${saved.getId()}`,
    );

    return { userSource: saved, created: true };
  }

  async getLink(
    userId: UserId,
    sourceId: SourceId,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<UserSource | null> {
    return this.userSourcesRepository.findByUserAndSource(
      userId,
      sourceId,
      loadOptions,
    );
  }

  async getAllSourceIdsByUser(userId: UserId): Promise<SourceId[]> {
    this.logger.debug(`Getting all source IDs for user ${userId}`);
    return this.userSourcesRepository.findAllSourceIdsByUser(userId);
  }

  async getAllByUser(
    userId: UserId,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<UserSource[]> {
    this.logger.debug(`Getting all user sources for user ${userId}`);
    return this.userSourcesRepository.findAllByUser(userId, loadOptions);
  }

  async getAllByUserPaginated(
    userId: UserId,
    params: PaginationParams,
    loadOptions?: UserSourceLoadOptions,
  ): Promise<PaginatedResult<UserSource>> {
    this.logger.debug(
      `Getting paginated user sources for user ${userId}: offset=${params.offset}, limit=${params.limit}`,
    );
    return await this.userSourcesRepository.findAllByUserPaginated(
      userId,
      params,
      loadOptions,
    );
  }

  async getAllByUserPaginatedFiltered(
    userId: UserId,
    params: PaginationParams,
    loadOptions?: UserSourceLoadOptions,
    filters?: UserSourcesFilterParams,
  ): Promise<PaginatedResult<UserSource>> {
    this.logger.debug(
      `Getting paginated filtered user sources for user ${userId}: offset=${params.offset}, limit=${params.limit}, search=${filters?.search}, sourceType=${filters?.sourceType}`,
    );
    return await this.userSourcesRepository.findAllByUserPaginatedFiltered(
      userId,
      params,
      loadOptions,
      filters,
    );
  }

  async getDistinctSourceTypes(userId: UserId): Promise<PublicSource[]> {
    this.logger.debug(`Getting distinct source types for user ${userId}`);
    return this.userSourcesRepository.getDistinctSourceTypesByUser(userId);
  }
}
