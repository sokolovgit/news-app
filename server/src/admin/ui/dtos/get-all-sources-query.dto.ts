import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/commons/types';
import { PublicSource } from '@/sources/domain/enums';
import { GetAllSourcesRequest } from '../../operation/requests';

export class GetAllSourcesQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'telegram',
    description: 'Search by name or URL',
    required: false,
  })
  search?: string;

  @IsEnum(PublicSource)
  @IsOptional()
  @ApiProperty({
    enum: PublicSource,
    example: PublicSource.TELEGRAM,
    description: 'Filter by source type',
    required: false,
  })
  sourceType?: PublicSource;

  toRequest(): GetAllSourcesRequest {
    return {
      offset: this.offset ?? 0,
      limit: this.limit ?? 50,
      search: this.search,
      sourceType: this.sourceType,
    };
  }
}

