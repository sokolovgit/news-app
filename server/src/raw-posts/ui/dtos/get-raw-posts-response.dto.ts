import { ApiProperty } from '@nestjs/swagger';

import { RawPostDto } from './raw-post.dto';
import { GetRawPostsResponse } from '@/raw-posts/operation/responses';

export class GetRawPostsResponseDto {
  @ApiProperty({
    description: 'Paginated posts',
    type: [RawPostDto],
  })
  data: RawPostDto[];

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

  static fromResponse(response: GetRawPostsResponse): GetRawPostsResponseDto {
    const dto = new GetRawPostsResponseDto();
    dto.data = response.data.map((post) => RawPostDto.fromEntity(post));
    dto.total = response.total;
    dto.offset = response.offset;
    dto.limit = response.limit;
    dto.hasMore = response.hasMore;
    return dto;
  }
}
