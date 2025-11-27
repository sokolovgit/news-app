import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { Auth } from '@/auth/decorators/auth.decorator';
import { User } from '@/users/domain/entities';
import { CurrentUser } from '@/users/decorators';
import { RawPostId } from '@/posts/domain/schemas';

import {
  GetRawPostsHandler,
  GetRawPostByIdHandler,
} from '@/posts/operation/handlers';
import {
  GetRawPostsQueryDto,
  GetRawPostsResponseDto,
  RawPostDto,
} from './dtos';

@ApiTags('raw-posts')
@Controller('raw-posts')
export class RawPostsController {
  constructor(
    private readonly getRawPostsHandler: GetRawPostsHandler,
    private readonly getRawPostByIdHandler: GetRawPostByIdHandler,
  ) {}

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

  @Get(':id')
  @Auth()
  @ApiOperation({
    summary: 'Get raw post by ID',
    description: 'Get a single raw post by its ID',
  })
  @ApiOkResponse({
    description: 'Raw post retrieved successfully',
    type: RawPostDto,
  })
  @ApiNotFoundResponse({
    description: 'Post not found',
  })
  public async getRawPostById(
    @CurrentUser() user: User,
    @Param('id') id: RawPostId,
  ): Promise<RawPostDto> {
    const rawPost = await this.getRawPostByIdHandler.handle({
      postId: id,
      userId: user.getId(),
    });
    return RawPostDto.fromEntity(rawPost);
  }
}
