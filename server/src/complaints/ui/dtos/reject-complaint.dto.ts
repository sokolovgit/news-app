import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { RejectComplaintRequest } from '@/complaints/operation/requests';
import { User } from '@/users/domain/entities';
import { ComplaintId } from '@/complaints/domain/schemas';

export class RejectComplaintDto {
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @ApiProperty({
    example: 'Complaint rejected as invalid',
    description: 'Optional rejection note',
    required: false,
    maxLength: 5000,
  })
  resolutionNote?: string;

  toRequest(complaintId: string, user: User): RejectComplaintRequest {
    return {
      complaintId: complaintId as ComplaintId,
      resolvedBy: user.getId(),
      resolutionNote: this.resolutionNote,
    };
  }
}
