import { ApiProperty } from '@nestjs/swagger';
import { GetComplaintsResponse } from '@/complaints/operation/responses';
import { ComplaintDto } from './complaint.dto';

export class GetComplaintsResponseDto {
  @ApiProperty({
    type: [ComplaintDto],
    description: 'List of complaints',
  })
  data: ComplaintDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of complaints',
  })
  total: number;

  @ApiProperty({
    example: 0,
    description: 'Offset for pagination',
  })
  offset: number;

  @ApiProperty({
    example: 20,
    description: 'Limit for pagination',
  })
  limit: number;

  static fromResponse(
    response: GetComplaintsResponse,
  ): GetComplaintsResponseDto {
    return {
      data: response.data.map((complaint) =>
        ComplaintDto.fromEntity(complaint),
      ),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  }
}
