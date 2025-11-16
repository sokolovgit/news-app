import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

import { AddSourceRequest } from '@/sources/operation/requests';
import { User } from '@/users/domain/entities';

export class AddSourceDto {
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  @ApiProperty({
    description: 'The URL of the source to follow',
    example: 'https://t.me/nasa',
  })
  url: string;

  toRequest(user: User): AddSourceRequest {
    return {
      url: this.url.trim(),
      userId: user.getId(),
    };
  }
}
