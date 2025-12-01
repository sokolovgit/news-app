import { ApiProperty } from '@nestjs/swagger';
import { PublicSource } from '@/sources/domain/enums';
import { SourceStats } from '../../service/admin-service/admin.service';

export class SourceStatsDto {
  @ApiProperty({ description: 'Total number of sources' })
  total: number;

  @ApiProperty({
    description: 'Source counts by type',
    example: {
      telegram: 10,
      instagram: 5,
      rss: 3,
      twitter: 2,
    },
  })
  byType: Record<PublicSource, number>;

  static fromStats(stats: SourceStats): SourceStatsDto {
    return {
      total: stats.total,
      byType: stats.byType,
    };
  }
}

