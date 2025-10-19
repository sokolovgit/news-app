import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, Post, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';

import {
  LoginHandler,
  RegisterHandler,
  RefreshTokenHandler,
  LogoutHandler,
} from '../operation/handlers';

import { LoginDto, RegisterDto, AuthenticationResultDto } from './dtos';
import { UserDto } from '@/users/ui/dtos';

import { User } from '@/users/domain/entities';
import { Auth } from '../decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { Cookies } from '@/cookies/decorators';
import { ValidateRefreshTokenPipe } from '../pipes/validate-refresh-token.pipe';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
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
  public async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authenticationResult = await this.registerHandler.handle(
      registerDto.toRequest(),
      response,
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
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authenticationResult = await this.loginHandler.handle(
      loginDto.toRequest(),
      response,
    );

    return AuthenticationResultDto.fromAuthenticationResult(
      authenticationResult,
    );
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description:
      'Refresh a token. The refresh token is sent in the cookies "refresh-token"',
  })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    type: AuthenticationResultDto,
  })
  @UsePipes(ValidateRefreshTokenPipe)
  public async refresh(
    @Cookies('refresh-token')
    refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authTokens = await this.refreshTokenHandler.handle(
      { refreshToken },
      response,
    );

    return AuthenticationResultDto.fromAuthenticationResult(authTokens);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logout a user by deleting the refresh token',
  })
  @ApiOkResponse({
    description: 'User logged out successfully',
  })
  public async logout(
    @Cookies('refresh-token') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.logoutHandler.handle({ refreshToken }, response);
  }
}
