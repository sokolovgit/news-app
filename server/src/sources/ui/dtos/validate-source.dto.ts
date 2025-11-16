import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

import { ValidateSourceRequest } from '@/sources/operation/requests';

export class ValidateSourceDto {
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  @ApiProperty({
    description: 'The URL of the source to validate',
    example: 'https://example.com',
  })
  url: string;

  toRequest(): ValidateSourceRequest {
    return {
      url: this.url.trim(),
    };
  }
}
