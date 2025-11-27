import { Module } from '@nestjs/common';
import { ServiceModule as ComplaintsServiceModule } from '../service/service.module';

import {
  CreateComplaintHandler,
  GetComplaintsHandler,
  ResolveComplaintHandler,
  RejectComplaintHandler,
  ReviewComplaintHandler,
} from './handlers';

const handlers = [
  CreateComplaintHandler,
  GetComplaintsHandler,
  ResolveComplaintHandler,
  RejectComplaintHandler,
  ReviewComplaintHandler,
];

@Module({
  imports: [ComplaintsServiceModule],
  providers: [...handlers],
  exports: [...handlers, ComplaintsServiceModule],
})
export class OperationModule {}
