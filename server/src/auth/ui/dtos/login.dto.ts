import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: true,
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'P@sswo2d',
    description: 'User password',
    required: true,
  })
  password: string;
}
