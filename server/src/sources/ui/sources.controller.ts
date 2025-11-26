import { ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { User } from '@/users/domain/entities';

import {
  AddSourceDto,
  AddedUserSourceDto,
  ValidateSourceDto,
  GetUserSourcesQueryDto,
  GetUserSourcesResponseDto,
  GetAllSourcesQueryDto,
  GetAllSourcesResponseDto,
} from './dtos';
import {
  AddSourceHandler,
  ValidateSourceHandler,
  GetUserSourcesHandler,
  GetAllSourcesHandler,
} from '../operation/handlers';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly addSourceHandler: AddSourceHandler,
    private readonly validateSourceHandler: ValidateSourceHandler,
    private readonly getUserSourcesHandler: GetUserSourcesHandler,
    private readonly getAllSourcesHandler: GetAllSourcesHandler,
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
  ): Promise<AddedUserSourceDto> {
    const response = await this.addSourceHandler.handle(
      addSourceDto.toRequest(user),
    );

    return AddedUserSourceDto.fromResponse(response);
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

  @Get('user')
  @Auth()
  @ApiOperation({
    summary: 'Get user sources',
    description: 'Get paginated sources followed by the current user',
  })
  public async getUserSources(
    @CurrentUser() user: User,
    @Query() query: GetUserSourcesQueryDto,
  ): Promise<GetUserSourcesResponseDto> {
    const response = await this.getUserSourcesHandler.handle(
      query.toRequest(user),
    );

    return GetUserSourcesResponseDto.fromResponse(response);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Get all public sources',
    description:
      'Get paginated public sources with subscription status for the current user',
  })
  public async getAllSources(
    @CurrentUser() user: User,
    @Query() query: GetAllSourcesQueryDto,
  ): Promise<GetAllSourcesResponseDto> {
    const response = await this.getAllSourcesHandler.handle(
      query.toRequest(user),
    );

    return GetAllSourcesResponseDto.fromResponse(response);
  }
}
