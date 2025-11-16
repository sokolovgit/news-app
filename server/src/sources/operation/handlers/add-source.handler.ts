import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourcesService } from '@/sources/service/sources-service';
import { SourceValidationService } from '@/sources/service/source-validation';
import { UserSourcesService } from '@/sources/service/user-sources-service';

import { AddSourceRequest } from '../requests';
import { AddSourceResponse } from '../responses';

@Injectable()
export class AddSourceHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly userSourcesService: UserSourcesService,
    private readonly sourceValidationService: SourceValidationService,
  ) {}

  async handle(request: AddSourceRequest): Promise<AddSourceResponse> {
    this.logger.log(
      `Handling add source request for user ${request.userId} and URL ${request.url}`,
    );

    const normalizedUrl = this.sourceValidationService.normalizeUrl(
      request.url,
    );

    let source = await this.sourcesService.getSourceByUrl(normalizedUrl);

    let isNewSource = false;

    if (!source) {
      this.logger.log(
        `Source for URL ${normalizedUrl} not found, validating and creating`,
      );

      const validation = await this.sourceValidationService.validateOrThrow(
        request.url,
      );

      source = await this.sourcesService.createSource({
        url: validation.url,
        name: validation.name,
        collector: validation.collector,
        source: validation.source,
        addedBy: request.userId,
      });

      isNewSource = true;
    }

    const linkResult = await this.userSourcesService.ensureLink(
      request.userId,
      source.getId(),
    );

    return {
      source,
      userSource: linkResult.userSource,
      isNewSource,
      isNewLink: linkResult.created,
    };
  }
}
