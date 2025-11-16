import { ApiProperty } from '@nestjs/swagger';

import { UserSource } from '@/sources/domain/entities';
import { SourceDto } from './source.dto';
import { SourceId, UserSourceId } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';

export class UserSourceDto {
  @ApiProperty({ description: 'Relation identifier' })
  id: UserSourceId;

  @ApiProperty()
  userId: UserId;

  @ApiProperty()
  sourceId: SourceId;

  @ApiProperty()
  isNewSource: boolean;

  @ApiProperty()
  isNewLink: boolean;

  @ApiProperty({ type: () => SourceDto })
  source: SourceDto;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;

  static fromEntities(
    userSource: UserSource,
    source: SourceDto,
    metadata: { isNewSource: boolean; isNewLink: boolean },
  ): UserSourceDto {
    const dto = new UserSourceDto();

    dto.id = userSource.getId();
    dto.userId = userSource.getUserId();
    dto.sourceId = userSource.getSourceId();
    dto.createdAt = userSource.getCreatedAt();
    dto.updatedAt = userSource.getUpdatedAt();
    dto.isNewSource = metadata.isNewSource;
    dto.isNewLink = metadata.isNewLink;
    dto.source = source;

    return dto;
  }
}
