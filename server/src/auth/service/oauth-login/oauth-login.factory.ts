import { Injectable } from '@nestjs/common';

import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthLoginStrategy } from './interfaces';

@Injectable()
export class OAuthLoginFactory {
  constructor(private readonly strategies: OAuthLoginStrategy[]) {}

  getStrategy(provider: OAuthProvider): OAuthLoginStrategy | undefined {
    return this.strategies.find((strategy) => strategy.supports(provider));
  }
}
