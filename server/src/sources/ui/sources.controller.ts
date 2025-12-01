import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { User } from '@/users/domain/entities';
import { PublicSource } from '@/sources/domain/enums';

import {
  AddSourceDto,
  AddedUserSourceDto,
  ValidateSourceDto,
  GetUserSourcesQueryDto,
  GetUserSourcesResponseDto,
  GetAllSourcesQueryDto,
  GetAllSourcesResponseDto,
  GetDashboardStatsResponseDto,
} from './dtos';
import {
  AddSourceHandler,
  ValidateSourceHandler,
  GetUserSourcesHandler,
  GetAllSourcesHandler,
  GetUserSourceTypesHandler,
  GetDashboardStatsHandler,
} from '../operation/handlers';
import { GetDashboardStatsRequest } from '../operation/requests';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly addSourceHandler: AddSourceHandler,
    private readonly validateSourceHandler: ValidateSourceHandler,
    private readonly getUserSourcesHandler: GetUserSourcesHandler,
    private readonly getAllSourcesHandler: GetAllSourcesHandler,
    private readonly getUserSourceTypesHandler: GetUserSourceTypesHandler,
    private readonly getDashboardStatsHandler: GetDashboardStatsHandler,
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

  @Get('user/types')
  @Auth()
  @ApiOperation({
    summary: 'Get user source types',
    description: 'Get distinct source types from user subscribed sources',
  })
  @ApiOkResponse({
    description: 'List of source types',
    type: [String],
    isArray: true,
  })
  public async getUserSourceTypes(
    @CurrentUser() user: User,
  ): Promise<PublicSource[]> {
    return this.getUserSourceTypesHandler.handle(user.getId());
  }

  @Get('dashboard/stats')
  @Auth()
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description:
      'Get dashboard statistics including total sources, posts today, and last updated time',
  })
  @ApiOkResponse({
    description: 'Dashboard statistics retrieved successfully',
    type: GetDashboardStatsResponseDto,
  })
  public async getDashboardStats(
    @CurrentUser() user: User,
  ): Promise<GetDashboardStatsResponseDto> {
    const response = await this.getDashboardStatsHandler.handle(
      new GetDashboardStatsRequest(user.getId()),
    );

    return GetDashboardStatsResponseDto.fromResponse(response);
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
