import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { UserSourcesService } from '@/user-sources';
import { UserId } from '@/users/domain/schemas';
import { PublicSource } from '@/sources/domain/enums';

@Injectable()
export class GetUserSourceTypesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly userSourcesService: UserSourcesService,
  ) {}

  async handle(userId: UserId): Promise<PublicSource[]> {
    this.logger.log(
      `Handling get user source types request for user ${userId}`,
    );

    const sourceTypes =
      await this.userSourcesService.getDistinctSourceTypes(userId);

    this.logger.log(
      `Found ${sourceTypes.length} distinct source types for user ${userId}`,
    );

    return sourceTypes;
  }
}

