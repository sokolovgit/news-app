import { ApiProperty } from '@nestjs/swagger';

import { FeedPostDto } from './feed-post.dto';
import { GetFeedResponse } from '@/posts/operation/responses';

export class GetFeedResponseDto {
  @ApiProperty({
    description: 'Paginated posts',
    type: [FeedPostDto],
  })
  data: FeedPostDto[];

  @ApiProperty({
    description: 'Total number of posts available',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of items skipped',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Maximum number of items requested',
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there are more items available',
    example: true,
  })
  hasMore: boolean;

  static fromResponse(response: GetFeedResponse): GetFeedResponseDto {
    const dto = new GetFeedResponseDto();
    dto.data = response.data.map((post) => FeedPostDto.fromEntity(post));
    dto.total = response.total;
    dto.offset = response.offset;
    dto.limit = response.limit;
    dto.hasMore = response.hasMore;
    return dto;
  }
}
