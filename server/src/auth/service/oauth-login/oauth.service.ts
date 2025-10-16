import { Injectable } from '@nestjs/common';

import { UsersService } from '@/users/service/users-service';

@Injectable()
export class OAuthService {
  constructor(private readonly usersService: UsersService) {}
}
