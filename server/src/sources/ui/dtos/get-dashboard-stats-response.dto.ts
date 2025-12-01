import { ApiProperty } from '@nestjs/swagger';

import { GetDashboardStatsResponse } from '@/sources/operation/responses';

export class GetDashboardStatsResponseDto {
  @ApiProperty({
    description: 'Total number of sources the user is following',
    example: 10,
  })
  totalSources: number;

  @ApiProperty({
    description: 'Number of posts created in the last 24 hours',
    example: 5,
  })
  postsToday: number;

  @ApiProperty({
    description: 'ISO timestamp of the most recent post or source update',
    example: '2025-01-15T10:30:00.000Z',
    nullable: true,
  })
  lastUpdated: string | null;

  static fromResponse(
    response: GetDashboardStatsResponse,
  ): GetDashboardStatsResponseDto {
    const dto = new GetDashboardStatsResponseDto();
    dto.totalSources = response.totalSources;
    dto.postsToday = response.postsToday;
    dto.lastUpdated = response.lastUpdated;
    return dto;
  }
}

