import { ApiProperty } from '@nestjs/swagger';
import { CreateComplaintResponse } from '@/complaints/operation/responses';
import { ComplaintDto } from './complaint.dto';

export class CreateComplaintResponseDto {
  @ApiProperty({
    type: ComplaintDto,
    description: 'Created complaint',
  })
  complaint: ComplaintDto;

  static fromResponse(
    response: CreateComplaintResponse,
  ): CreateComplaintResponseDto {
    return {
      complaint: ComplaintDto.fromEntity(response.complaint),
    };
  }
}
