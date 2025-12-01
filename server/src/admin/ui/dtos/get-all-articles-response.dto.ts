import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from '@/commons/types';
import { Article } from '@/articles/domain/entities';
import { ArticleDto } from '@/articles/ui/dtos';

export class GetAllArticlesResponseDto {
  @ApiProperty({
    type: [ArticleDto],
    description: 'List of articles',
  })
  data: ArticleDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of articles',
  })
  total: number;

  @ApiProperty({
    example: 0,
    description: 'Offset for pagination',
  })
  offset: number;

  @ApiProperty({
    example: 20,
    description: 'Limit for pagination',
  })
  limit: number;

  static fromResponse(
    response: PaginatedResult<Article>,
  ): GetAllArticlesResponseDto {
    return {
      data: response.data.map((article) => ArticleDto.fromEntity(article)),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  }
}

