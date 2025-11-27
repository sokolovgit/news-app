import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/commons/types';
import { GetComplaintsRequest } from '@/complaints/operation/requests';
import {
  ComplaintStatus,
  ComplaintTargetType,
} from '@/complaints/domain/enums';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

export class GetComplaintsQueryDto extends PaginationQueryDto {
  @IsEnum(ComplaintStatus)
  @IsOptional()
  @ApiProperty({
    enum: ComplaintStatus,
    example: ComplaintStatus.PENDING,
    description: 'Filter by complaint status',
    required: false,
  })
  status?: ComplaintStatus;

  @IsEnum(ComplaintTargetType)
  @IsOptional()
  @ApiProperty({
    enum: ComplaintTargetType,
    example: ComplaintTargetType.POST,
    description: 'Filter by target type',
    required: false,
  })
  targetType?: ComplaintTargetType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by target ID',
    required: false,
  })
  targetId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by reporter user ID',
    required: false,
  })
  reportedBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'createdAt',
    description: 'Sort field',
    required: false,
    enum: ['createdAt', 'updatedAt', 'status'],
  })
  sortField?: 'createdAt' | 'updatedAt' | 'status';

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'desc',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc';

  toRequest(user?: User): GetComplaintsRequest {
    return {
      userId: user?.getId(),
      status: this.status,
      targetType: this.targetType,
      targetId: this.targetId,
      reportedBy: this.reportedBy as UserId | undefined,
      offset: this.offset ?? 0,
      limit: this.limit ?? 50,
      sort:
        this.sortField && this.sortOrder
          ? {
              field: this.sortField,
              order: this.sortOrder,
            }
          : undefined,
    };
  }
}
