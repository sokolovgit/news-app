import { ApiProperty } from '@nestjs/swagger';

import { Source } from '@/sources/domain/entities';
import { PublicSource } from '@/sources/domain/enums';
import { SourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';

export class SourceDto {
  @ApiProperty({ description: 'Source identifier' })
  id: SourceId;

  @ApiProperty({ description: 'URL of the source' })
  url: string;

  @ApiProperty({ description: 'Display name of the source' })
  name: string;

  @ApiProperty({ enum: PublicSource })
  source: PublicSource;

  @ApiProperty({
    description: 'User that initially added the source',
    required: false,
  })
  addedBy?: UserId;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;

  static fromEntity(source: Source): SourceDto {
    const dto = new SourceDto();
    dto.id = source.getId();
    dto.url = source.getUrl();
    dto.name = source.getName();
    dto.source = source.getSource();
    dto.addedBy = source.getUserAddedById();
    dto.createdAt = source.getCreatedAt();
    dto.updatedAt = source.getUpdatedAt();
    return dto;
  }
}
