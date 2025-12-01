import { Module } from '@nestjs/common';
import { AdminService } from './admin-service/admin.service';
import { UsersModule } from '@/users/users.module';
import { SourcesModule } from '@/sources/sources.module';
import { ArticlesModule } from '@/articles/articles.module';
import { ComplaintsModule } from '@/complaints/complaints.module';

@Module({
  imports: [UsersModule, SourcesModule, ArticlesModule, ComplaintsModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class ServiceModule {}
