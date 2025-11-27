import { ApiProperty } from '@nestjs/swagger';

import { SourceDto } from './source.dto';

import { GetAllSourcesResponse } from '@/sources/operation/responses';

export class SourceWithSubscriptionStatusDto {
  @ApiProperty({ type: () => SourceDto })
  source: SourceDto;

  @ApiProperty({
    description: 'Whether the current user is subscribed to this source',
    example: true,
  })
  isSubscribed: boolean;
}

export class GetAllSourcesResponseDto {
  @ApiProperty({
    description: 'Paginated sources with subscription status',
    type: [SourceWithSubscriptionStatusDto],
  })
  data: SourceWithSubscriptionStatusDto[];

  @ApiProperty({
    description: 'Total number of sources available',
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

  static fromResponse(
    response: GetAllSourcesResponse,
  ): GetAllSourcesResponseDto {
    const dto = new GetAllSourcesResponseDto();

    dto.data = response.data.map((item) => ({
      source: SourceDto.fromEntity(item.source),
      isSubscribed: item.isSubscribed,
    }));
    dto.total = response.total;
    dto.offset = response.offset;
    dto.limit = response.limit;
    dto.hasMore = response.hasMore;
    return dto;
  }
}
