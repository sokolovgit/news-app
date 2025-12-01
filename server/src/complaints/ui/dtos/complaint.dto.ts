import { ApiProperty } from '@nestjs/swagger';
import { Complaint } from '@/complaints/domain/entities';
import {
  ComplaintStatus,
  ComplaintReason,
  ComplaintTargetType,
} from '@/complaints/domain/enums';
import { UserDto } from '@/users/ui/dtos/user.dto';

export class ComplaintDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Complaint ID',
  })
  id: string;

  @ApiProperty({
    enum: ComplaintTargetType,
    example: ComplaintTargetType.POST,
    description: 'Type of target',
  })
  targetType: ComplaintTargetType;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the target',
  })
  targetId: string;

  @ApiProperty({
    enum: ComplaintReason,
    example: ComplaintReason.SPAM,
    description: 'Reason for complaint',
  })
  reason: ComplaintReason;

  @ApiProperty({
    example: 'This post contains inappropriate content',
    description: 'Description of the complaint',
    required: false,
  })
  description?: string;

  @ApiProperty({
    enum: ComplaintStatus,
    example: ComplaintStatus.PENDING,
    description: 'Status of the complaint',
  })
  status: ComplaintStatus;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of user who reported',
  })
  reportedBy: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of user who resolved',
    required: false,
  })
  resolvedBy?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'When complaint was resolved',
    required: false,
  })
  resolvedAt?: Date;

  @ApiProperty({
    example: 'Complaint resolved after review',
    description: 'Resolution note',
    required: false,
  })
  resolutionNote?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'When complaint was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'When complaint was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    type: UserDto,
    description: 'User who reported the complaint',
    required: false,
  })
  reporter?: UserDto;

  @ApiProperty({
    type: UserDto,
    description: 'User who resolved the complaint',
    required: false,
  })
  resolver?: UserDto;

  static fromEntity(complaint: Complaint): ComplaintDto {
    const dto: ComplaintDto = {
      id: complaint.getId(),
      targetType: complaint.getTargetType(),
      targetId: complaint.getTargetId(),
      reason: complaint.getReason(),
      description: complaint.getDescription(),
      status: complaint.getStatus(),
      reportedBy: complaint.getReportedBy(),

      resolvedBy: complaint.getResolvedBy(),
      resolvedAt: complaint.getResolvedAt(),
      resolutionNote: complaint.getResolutionNote(),
      createdAt: complaint.getCreatedAt()!,
      updatedAt: complaint.getUpdatedAt()!,
    };

    const reporter = complaint.getReporter();

    if (reporter) {
      dto.reporter = UserDto.fromUserEntity(reporter);
    }

    const resolver = complaint.getResolver();

    if (resolver) {
      dto.resolver = UserDto.fromUserEntity(resolver);
    }

    return dto;
  }
}
