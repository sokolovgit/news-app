import { ApiProperty } from '@nestjs/swagger';

import { RawPost } from '@/raw-posts/domain/entities';
import { Content } from '@/raw-posts/domain/types';
import { SourceDto } from '@/sources/ui/dtos';

export class RawPostDto {
  @ApiProperty({ description: 'Post identifier' })
  id: string;

  @ApiProperty({ description: 'Source identifier' })
  sourceId: string;

  @ApiProperty({ description: 'External identifier from the source' })
  externalId: string;

  @ApiProperty({
    description: 'Post title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Post content blocks',
    type: 'array',
  })
  content: Content;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Source information',
    required: false,
    type: SourceDto,
  })
  source?: SourceDto;

  static fromEntity(post: RawPost): RawPostDto {
    const dto = new RawPostDto();
    dto.id = post.getId();
    dto.sourceId = post.getSourceId();
    dto.externalId = post.getExternalId();
    dto.title = post.getTitle();
    dto.content = post.getContent();
    dto.createdAt = post.getCreatedAt();
    dto.updatedAt = post.getUpdatedAt();

    const source = post.getSource();
    if (source) {
      dto.source = SourceDto.fromEntity(source);
    }

    return dto;
  }
}
