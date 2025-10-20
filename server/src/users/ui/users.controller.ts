import { Auth } from '@/auth/decorators/auth.decorator';
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../decorators';
import { User } from '../domain/entities';
import { UserDto } from './dtos';

@Controller('users')
export class UsersController {
  @Get()
  @Auth()
  public getUsers(@CurrentUser() user: User) {
    return UserDto.fromUserEntity(user);
  }
}
