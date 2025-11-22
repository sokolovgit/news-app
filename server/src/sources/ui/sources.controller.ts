import { ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { User } from '@/users/domain/entities';

import {
  AddSourceDto,
  SourceDto,
  UserSourceDto,
  ValidateSourceDto,
} from './dtos';
import { AddSourceHandler, ValidateSourceHandler } from '../operation/handlers';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly addSourceHandler: AddSourceHandler,
    private readonly validateSourceHandler: ValidateSourceHandler,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Follow a source',
    description:
      'Creates a user-to-source relation, creating the source if needed',
  })
  public async addSource(
    @CurrentUser() user: User,
    @Body() addSourceDto: AddSourceDto,
  ) {
    const response = await this.addSourceHandler.handle(
      addSourceDto.toRequest(user),
    );

    return UserSourceDto.fromEntities(
      response.userSource,
      SourceDto.fromEntity(response.source),
      {
        isNewSource: response.isNewSource,
        isNewLink: response.isNewLink,
      },
    );
  }

  @Post('validate')
  @Auth()
  @ApiOperation({
    summary: 'Validate a source',
    description: 'Validate a source',
  })
  public validateSource(@Body() validateSourceDto: ValidateSourceDto) {
    return this.validateSourceHandler.handle(validateSourceDto.toRequest());
  }
}
