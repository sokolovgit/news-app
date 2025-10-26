import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  Get,
  Res,
  Body,
  Post,
  Query,
  UsePipes,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import {
  GetMeHandler,
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  VerifyEmailHandler,
  RefreshTokenHandler,
} from '../operation/handlers';

import {
  MeDto,
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
  AuthenticationResultDto,
} from './dtos';

import { User } from '@/users/domain/entities';
import { CurrentUser } from '@/users/decorators';

import { Auth } from '../decorators/auth.decorator';
import { Cookies } from '@/cookies/decorators';

import { ValidateRefreshTokenPipe } from '../pipes';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly getMeHandler: GetMeHandler,
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
  ) {}

  @Get('me')
  @Auth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get the current user',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: MeDto,
  })
  public async me(@CurrentUser() user: User) {
    const me = await this.getMeHandler.handle(user.getId());

    return MeDto.fromGetMeResponse(me);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(ValidateRefreshTokenPipe)
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

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Verify email',
    description: 'Verify an email by sending a verification email',
  })
  @ApiOkResponse({
    description: 'Email verified successfully',
  })
  public async verifyEmail(@Query() verifyEmailQuery: VerifyEmailDto) {
    await this.verifyEmailHandler.handle(verifyEmailQuery.token);
  }
}
