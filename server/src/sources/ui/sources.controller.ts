import { ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Get, Post } from '@nestjs/common';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { User } from '@/users/domain/entities';

import {
  AddSourceDto,
  SourceDto,
  UserSourceDto,
  ValidateSourceDto,
} from './dtos';
import {
  AddSourceHandler,
  TestHandler,
  ValidateSourceHandler,
} from '../operation/handlers';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly addSourceHandler: AddSourceHandler,
    private readonly validateSourceHandler: ValidateSourceHandler,
    private readonly testSourceHandler: TestHandler,
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

  @Get('test')
  @ApiOperation({
    summary: 'Test a source',
    description: 'Test a source',
  })
  public async testSource() {
    return this.testSourceHandler.handle();
  }
}
