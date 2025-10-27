import { ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { ValidateSourceDto } from './dtos';
import { ValidateSourceHandler } from '../operation/handlers';

@Controller('sources')
export class SourcesController {
  constructor(private readonly validateSourceHandler: ValidateSourceHandler) {}

  //   @Post()
  //   @ApiOperation({
  //     summary: 'Add a new source',
  //     description: 'Create a new source for posts',
  //   })
  //   public async addSource(@Body() addSourceDto: any) {
  //     // return this.telegramService.addSource(addSourceDto);
  //   }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate a source',
    description: 'Validate a source',
  })
  public async validateSource(@Body() validateSourceDto: ValidateSourceDto) {
    return this.validateSourceHandler.handle(validateSourceDto.toRequest());
  }
}
