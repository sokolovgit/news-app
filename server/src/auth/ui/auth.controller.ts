import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, Post } from '@nestjs/common';

import { LoginHandler, RegisterHandler } from '../operation/handlers';

import { UserDto } from '@/users/ui/dtos';
import { AuthenticationResultDto, LoginDto, RegisterDto } from './dtos';

import { User } from '@/users/domain/entities';
import { Auth } from '../decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
  ) {}

  @Get('me')
  @Auth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get the current user',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserDto,
  })
  public me(@CurrentUser() user: User) {
    return UserDto.fromUserEntity(user);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register user',
    description:
      'Register a new user with email and password if email is not taken',
  })
  @ApiOkResponse({
    description: 'User registered successfully',
    type: AuthenticationResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Email is already taken',
  })
  public async register(@Body() registerDto: RegisterDto) {
    const authenticationResult = await this.registerHandler.handle(
      registerDto.toRequest(),
    );

    return AuthenticationResultDto.fromAuthenticationResult(
      authenticationResult,
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Login a user with email and password',
  })
  @ApiOkResponse({
    description: 'User logged in successfully',
    type: AuthenticationResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
  })
  public async login(@Body() loginDto: LoginDto) {
    const authenticationResult = await this.loginHandler.handle(
      loginDto.toRequest(),
    );

    return AuthenticationResultDto.fromAuthenticationResult(
      authenticationResult,
    );
  }
}
