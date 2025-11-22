import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourcesService } from '@/sources/service/sources-service';
import { SourcesValidationService } from '@/sources/service/sources-validation';
import { SourceStatus } from '@/sources/domain/enums';
import { UserSourcesService } from '@/user-sources';

import { AddSourceRequest } from '../requests';
import { AddSourceResponse } from '../responses';

@Injectable()
export class AddSourceHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly userSourcesService: UserSourcesService,
    private readonly sourcesValidationService: SourcesValidationService,
  ) {}

  async handle(request: AddSourceRequest): Promise<AddSourceResponse> {
    this.logger.log(
      `Handling add source request for user ${request.userId} and URL ${request.url}`,
    );

    const normalizedUrl = this.sourcesValidationService.normalizeUrl(
      request.url,
    );

    let source = await this.sourcesService.getSourceByUrl(normalizedUrl);

    let isNewSource = false;

    if (!source) {
      this.logger.log(
        `Source for URL ${normalizedUrl} not found, validating and creating`,
      );

      // Fast validation: cache, URL format, DB check
      const validation = await this.sourcesValidationService.validateUrl(
        request.url,
      );

      // Create source with pending_validation status
      source = await this.sourcesService.createSource({
        url: validation.url,
        name: validation.name,
        source: validation.source,
        addedBy: request.userId,
        status: SourceStatus.PENDING_VALIDATION,
      });

      // Validate source directly (async, non-blocking)

      await this.sourcesValidationService.validateUrl(request.url);

      this.logger.log(
        `Created source ${source.getId()} with pending_validation status, validation started`,
      );

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
