import { ApiProperty } from '@nestjs/swagger';

import { SourceDto } from './source.dto';
import { UserSourceDto } from './user-source.dto';

import { GetUserSourcesResponse } from '@/sources/operation/responses';

export class GetUserSourcesResponseDto {
  @ApiProperty({
    description: 'Paginated user sources',
    type: [UserSourceDto],
  })
  data: UserSourceDto[];

  @ApiProperty({
    description: 'Total number of user sources available',
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
    response: GetUserSourcesResponse,
  ): GetUserSourcesResponseDto {
    const dto = new GetUserSourcesResponseDto();

    dto.data = response.data.map((userSource) =>
      UserSourceDto.fromEntities(
        userSource,
        SourceDto.fromEntity(userSource.getSource()!),
      ),
    );
    dto.total = response.total;
    dto.offset = response.offset;
    dto.limit = response.limit;
    dto.hasMore = response.hasMore;
    return dto;
  }
}
