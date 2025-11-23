import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { User } from '@/users/domain/entities';

import { GetFeedHandler } from '@/posts/operation/handlers';
import { GetFeedQueryDto, GetFeedResponseDto } from './dtos';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly getFeedHandler: GetFeedHandler) {}

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Get user feed',
    description:
      'Get paginated posts from user sources with optional filters, search, and sorting',
  })
  @ApiOkResponse({
    description: 'Feed retrieved successfully',
    type: GetFeedResponseDto,
  })
  public async getFeed(
    @CurrentUser() user: User,
    @Query() query: GetFeedQueryDto,
  ): Promise<GetFeedResponseDto> {
    const request = query.toRequest(user);
    const response = await this.getFeedHandler.handle(request);
    return GetFeedResponseDto.fromResponse(response);
  }
}
