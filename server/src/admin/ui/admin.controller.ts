import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Auth } from '@/auth/decorators/auth.decorator';
import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';
import { CurrentUser } from '@/users/decorators';

import {
  GetAllUsersHandler,
  GetAllSourcesHandler,
  GetAllArticlesHandler,
  GetSourceStatsHandler,
} from '../operation/handlers';
import {
  GetAllUsersResponseDto,
  GetAllUsersQueryDto,
  GetAllSourcesResponseDto,
  GetAllSourcesQueryDto,
  SourceStatsDto,
  GetAllArticlesResponseDto,
  GetAllArticlesQueryDto,
} from './dtos';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly getAllUsersHandler: GetAllUsersHandler,
    private readonly getAllSourcesHandler: GetAllSourcesHandler,
    private readonly getAllArticlesHandler: GetAllArticlesHandler,
    private readonly getSourceStatsHandler: GetSourceStatsHandler,
  ) {}

  @Get('users')
  @Auth([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get all users (admin only)',
    description: 'Get paginated list of all users with optional filters',
  })
  @ApiOkResponse({
    type: GetAllUsersResponseDto,
    description: 'Users retrieved successfully',
  })
  public async getAllUsers(
    @CurrentUser() user: User,
    @Query() query: GetAllUsersQueryDto,
  ): Promise<GetAllUsersResponseDto> {
    const response = await this.getAllUsersHandler.handle(query.toRequest());
    return GetAllUsersResponseDto.fromResponse(response);
  }

  @Get('sources')
  @Auth([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get all sources (admin only)',
    description: 'Get paginated list of all sources with optional filters',
  })
  @ApiOkResponse({
    type: GetAllSourcesResponseDto,
    description: 'Sources retrieved successfully',
  })
  public async getAllSources(
    @CurrentUser() user: User,
    @Query() query: GetAllSourcesQueryDto,
  ): Promise<GetAllSourcesResponseDto> {
    const response = await this.getAllSourcesHandler.handle(query.toRequest());
    return GetAllSourcesResponseDto.fromResponse(response);
  }

  @Get('sources/stats')
  @Auth([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get source statistics (admin only)',
    description: 'Get statistics about sources including counts by type',
  })
  @ApiOkResponse({
    type: SourceStatsDto,
    description: 'Source statistics retrieved successfully',
  })
  public async getSourceStats(): Promise<SourceStatsDto> {
    const response = await this.getSourceStatsHandler.handle();

    return SourceStatsDto.fromStats(response);
  }

  @Get('articles')
  @Auth([UserRole.ADMIN])
  @ApiOperation({
    summary: 'Get all articles (admin only)',
    description:
      'Get paginated list of all published articles with optional filters',
  })
  @ApiOkResponse({
    type: GetAllArticlesResponseDto,
    description: 'Articles retrieved successfully',
  })
  public async getAllArticles(
    @CurrentUser() user: User,
    @Query() query: GetAllArticlesQueryDto,
  ): Promise<GetAllArticlesResponseDto> {
    const response = await this.getAllArticlesHandler.handle(query.toRequest());
    return GetAllArticlesResponseDto.fromResponse(response);
  }
}
