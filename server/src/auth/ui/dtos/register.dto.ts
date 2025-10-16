import {
  IsEmail,
  IsString,
  IsDefined,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { RegisterRequest } from '@/auth/operation/requests';

export class RegisterDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: true,
  })
  email: string;

  @IsDefined()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
  })
  @ApiProperty({
    example: 'P@sswo2d',
    description: 'User password',
    required: true,
  })
  password: string;

  toRequest(): RegisterRequest {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
