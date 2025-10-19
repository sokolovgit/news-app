import { DynamicModule, Global, Module } from '@nestjs/common';
import { CookiesService } from './cookies.service';

@Global()
@Module({})
export class CookiesModule {
  static forRoot(): DynamicModule {
    return {
      module: CookiesModule,
      providers: [CookiesService],
      exports: [CookiesService],
    };
  }
}
