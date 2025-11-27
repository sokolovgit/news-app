import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { CreateComplaintRequest } from '@/complaints/operation/requests';
import {
  ComplaintTargetType,
  ComplaintReason,
} from '@/complaints/domain/enums';
import { User } from '@/users/domain/entities';

export class CreateComplaintDto {
  @IsEnum(ComplaintTargetType)
  @IsNotEmpty()
  @ApiProperty({
    enum: ComplaintTargetType,
    example: ComplaintTargetType.POST,
    description: 'Type of target being complained about',
    required: true,
  })
  targetType: ComplaintTargetType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the target (source or post)',
    required: true,
  })
  targetId: string;

  @IsEnum(ComplaintReason)
  @IsNotEmpty()
  @ApiProperty({
    enum: ComplaintReason,
    example: ComplaintReason.SPAM,
    description: 'Reason for the complaint',
    required: true,
  })
  reason: ComplaintReason;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @ApiProperty({
    example: 'This post contains inappropriate content',
    description: 'Optional description of the complaint',
    required: false,
    maxLength: 5000,
  })
  description?: string;

  toRequest(user: User): CreateComplaintRequest {
    return {
      userId: user.getId(),
      targetType: this.targetType,
      targetId: this.targetId,
      reason: this.reason,
      description: this.description,
    };
  }
}
