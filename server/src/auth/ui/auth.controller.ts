import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dtos';
import { RegisterHandler } from '../operation/handlers';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserDto } from '@/users/ui/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerHandler: RegisterHandler) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register user',
    description:
      'Register a new user with email and password if email is not taken',
  })
  @ApiOkResponse({
    description: 'User registered successfully',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Email is already taken',
  })
  public async register(@Body() registerDto: RegisterDto) {
    const user = await this.registerHandler.handle(registerDto.toRequest());

    return UserDto.fromUser(user);
  }
}
