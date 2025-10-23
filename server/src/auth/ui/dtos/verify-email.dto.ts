import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The token to verify the email',
    example: '1234567890',
  })
  token: string;
}
