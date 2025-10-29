import { Module } from '@nestjs/common';
import { ServiceModule } from './service';

@Module({
  imports: [ServiceModule],
  exports: [ServiceModule],
})
export class PostsModule {}
