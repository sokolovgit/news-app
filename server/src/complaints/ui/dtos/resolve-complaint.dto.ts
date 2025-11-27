import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ResolveComplaintRequest } from '@/complaints/operation/requests';
import { User } from '@/users/domain/entities';
import { ComplaintId } from '@/complaints/domain/schemas';

export class ResolveComplaintDto {
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @ApiProperty({
    example: 'Complaint resolved after review',
    description: 'Optional resolution note',
    required: false,
    maxLength: 5000,
  })
  resolutionNote?: string;

  toRequest(complaintId: string, user: User): ResolveComplaintRequest {
    return {
      complaintId: complaintId as ComplaintId,
      resolvedBy: user.getId(),
      resolutionNote: this.resolutionNote,
    };
  }
}
