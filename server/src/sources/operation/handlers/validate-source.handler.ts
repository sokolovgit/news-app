import { Injectable, NotImplementedException } from '@nestjs/common';
import { ValidateSourceRequest } from '../requests';

@Injectable()
export class ValidateSourceHandler {
  constructor() {}

  async handle(request: ValidateSourceRequest): Promise<void> {
    console.log('validating source', request);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
  }
}
