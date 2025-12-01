import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { PaginationQueryDto } from '@/commons/types';
import { GetUserSourcesRequest } from '@/sources/operation/requests';
import { User } from '@/users/domain/entities';
import { PublicSource } from '@/sources/domain/enums';

export class GetUserSourcesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search query for source name',
    required: false,
    example: 'bbc news',
  })
  search?: string;

  @IsOptional()
  @IsEnum(PublicSource)
  @ApiProperty({
    description: 'Filter by source type',
    required: false,
    enum: PublicSource,
    enumName: 'PublicSource',
    example: PublicSource.TELEGRAM,
  })
  sourceType?: PublicSource;

  toRequest(user: User): GetUserSourcesRequest {
    const pagination = this.toPaginationParams();

    return new GetUserSourcesRequest(user.getId(), pagination, {
      search: this.search?.trim() || undefined,
      sourceType: this.sourceType,
    });
  }
}
