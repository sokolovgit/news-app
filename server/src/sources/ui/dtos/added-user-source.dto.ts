import { ApiProperty } from '@nestjs/swagger';

import { UserSourceDto } from './user-source.dto';
import { AddSourceResponse } from '@/sources/operation/responses';
import { SourceDto } from './source.dto';

export class AddedUserSourceDto extends UserSourceDto {
  @ApiProperty({ description: 'Whether the source was newly created' })
  isNewSource: boolean;

  @ApiProperty({ description: 'Whether the link was newly created' })
  isNewLink: boolean;

  static fromResponse(response: AddSourceResponse): AddedUserSourceDto {
    const dto = new AddedUserSourceDto();

    dto.isNewSource = response.isNewSource;
    dto.isNewLink = response.isNewLink;
    dto.id = response.userSource.getId();
    dto.userId = response.userSource.getUserId();
    dto.sourceId = response.userSource.getSourceId();
    dto.source = SourceDto.fromEntity(response.source);
    dto.createdAt = response.userSource.getCreatedAt();
    dto.updatedAt = response.userSource.getUpdatedAt();

    return dto;
  }
}
