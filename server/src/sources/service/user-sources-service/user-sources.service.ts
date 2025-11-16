import { Injectable } from '@nestjs/common';

import { LoadState } from '@/commons/types';
import { uuid } from '@/commons/utils';

import { LoggerService } from '@/logger';
import { UserSourcesRepository } from '../abstracts';

import { UserSource, UserSourceLoadOptions } from '@/sources/domain/entities';
import { SourceId, UserSourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';
import { UserSourceCreationFailedError } from '@/sources/domain/errors';

type LinkResult = {
  userSource: UserSource;
  created: boolean;
};

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
}
