import { ApiProperty } from '@nestjs/swagger';

import { ArticleDto } from './article.dto';
import { GetArticlesResponse } from '@/articles/operation/responses';

export class GetArticlesResponseDto {
  @ApiProperty({
    description: 'Paginated articles',
    type: [ArticleDto],
  })
  data: ArticleDto[];

  @ApiProperty({
    description: 'Total number of articles available',
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

  static fromResponse(response: GetArticlesResponse): GetArticlesResponseDto {
    const dto = new GetArticlesResponseDto();
    dto.data = response.data.map((article) => ArticleDto.fromEntity(article));
    dto.total = response.total;
    dto.offset = response.offset;
    dto.limit = response.limit;
    dto.hasMore = response.hasMore;
    return dto;
  }
}
