import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Auth } from '@/auth/decorators/auth.decorator';
import { User } from '@/users/domain/entities';
import { CurrentUser } from '@/users/decorators';

import { GetRawPostsHandler } from '@/posts/operation/handlers';
import { GetRawPostsQueryDto, GetRawPostsResponseDto } from './dtos';

@ApiTags('raw-posts')
@Controller('raw-posts')
export class RawPostsController {
  constructor(private readonly getRawPostsHandler: GetRawPostsHandler) {}

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Get raw posts',
    description:
      'Get paginated posts with optional filters, search, and sorting',
  })
  @ApiOkResponse({
    description: 'Raw posts retrieved successfully',
    type: GetRawPostsResponseDto,
  })
  public async getRawPosts(
    @CurrentUser() user: User,
    @Query() query: GetRawPostsQueryDto,
  ): Promise<GetRawPostsResponseDto> {
    const request = query.toRequest(user);
    const response = await this.getRawPostsHandler.handle(request);
    return GetRawPostsResponseDto.fromResponse(response);
  }
}
