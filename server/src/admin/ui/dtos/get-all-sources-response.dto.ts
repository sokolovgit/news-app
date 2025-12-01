import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from '@/commons/types';
import { Source } from '@/sources/domain/entities';
import { SourceDto } from '@/sources/ui/dtos';

export class GetAllSourcesResponseDto {
  @ApiProperty({
    type: [SourceDto],
    description: 'List of sources',
  })
  data: SourceDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of sources',
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
    response: PaginatedResult<Source>,
  ): GetAllSourcesResponseDto {
    return {
      data: response.data.map((source) => SourceDto.fromEntity(source)),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  }
}

