import { Injectable } from '@nestjs/common';
import { ValidateSourceRequest } from '../requests';

import { SourceValidationService } from '@/sources/service/source-validation';
import { ValidateSourceResponse } from '../responses';

@Injectable()
export class ValidateSourceHandler {
  constructor(
    private readonly sourceValidationService: SourceValidationService,
  ) {}

  async handle(
    request: ValidateSourceRequest,
  ): Promise<ValidateSourceResponse> {
    return await this.sourceValidationService.validateOrThrow(request.url);
  }
}
