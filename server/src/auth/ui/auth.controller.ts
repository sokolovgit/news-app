import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dtos';
import { RegisterHandler } from '../operation/handlers';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerHandler: RegisterHandler) {}

  @Post('register')
  public async register(@Body() registerDto: RegisterDto) {
    const user = await this.registerHandler.handle(registerDto.toRequest());

    return { user };
  }
}
