import { UserId } from '@/users/domain/schemas';

export class GetDashboardStatsRequest {
  constructor(public readonly userId: UserId) {}
}

