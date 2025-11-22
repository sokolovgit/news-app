import { Injectable } from '@nestjs/common';
import { ValidateSourceRequest } from '../requests';

import { SourcesValidationService } from '@/sources/service/sources-validation';
import { ValidateSourceResponse } from '../responses';

@Injectable()
export class ValidateSourceHandler {
  constructor(
    private readonly sourcesValidationService: SourcesValidationService,
  ) {}

  async handle(
    request: ValidateSourceRequest,
  ): Promise<ValidateSourceResponse> {
    return await this.sourcesValidationService.validateUrl(request.url);
  }
}
