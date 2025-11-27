import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/users/decorators';
import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';
import { ComplaintId } from '@/complaints/domain/schemas';

import {
  CreateComplaintDto,
  CreateComplaintResponseDto,
  GetComplaintsQueryDto,
  GetComplaintsResponseDto,
  ResolveComplaintDto,
  RejectComplaintDto,
  ComplaintDto,
} from './dtos';

import {
  CreateComplaintHandler,
  GetComplaintsHandler,
  ResolveComplaintHandler,
  RejectComplaintHandler,
  ReviewComplaintHandler,
} from '../operation/handlers';

@Controller('complaints')
export class ComplaintsController {
  constructor(
    private readonly createComplaintHandler: CreateComplaintHandler,
    private readonly getComplaintsHandler: GetComplaintsHandler,
    private readonly resolveComplaintHandler: ResolveComplaintHandler,
    private readonly rejectComplaintHandler: RejectComplaintHandler,
    private readonly reviewComplaintHandler: ReviewComplaintHandler,
  ) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a complaint',
    description: 'Create a complaint for a source or post',
  })
  @ApiOkResponse({
    type: CreateComplaintResponseDto,
    description: 'Complaint created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid complaint data' })
  public async createComplaint(
    @CurrentUser() user: User,
    @Body() createComplaintDto: CreateComplaintDto,
  ): Promise<CreateComplaintResponseDto> {
    const response = await this.createComplaintHandler.handle(
      createComplaintDto.toRequest(user),
    );

    return CreateComplaintResponseDto.fromResponse(response);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Get complaints',
    description: 'Get paginated list of complaints with filters',
  })
  @ApiOkResponse({
    type: GetComplaintsResponseDto,
    description: 'Complaints retrieved successfully',
  })
  public async getComplaints(
    @CurrentUser() user: User,
    @Query() query: GetComplaintsQueryDto,
  ): Promise<GetComplaintsResponseDto> {
    const response = await this.getComplaintsHandler.handle(
      query.toRequest(user),
    );

    return GetComplaintsResponseDto.fromResponse(response);
  }

  @Post(':id/resolve')
  @Auth([UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolve a complaint',
    description: 'Mark a complaint as resolved (admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Complaint ID',
    type: String,
  })
  @ApiOkResponse({
    type: ComplaintDto,
    description: 'Complaint resolved successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid complaint or already resolved',
  })
  public async resolveComplaint(
    @CurrentUser() user: User,
    @Param('id') complaintId: string,
    @Body() resolveComplaintDto: ResolveComplaintDto,
  ): Promise<ComplaintDto> {
    const response = await this.resolveComplaintHandler.handle(
      resolveComplaintDto.toRequest(complaintId, user),
    );

    return ComplaintDto.fromEntity(response.complaint);
  }

  @Post(':id/reject')
  @Auth([UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a complaint',
    description: 'Mark a complaint as rejected (admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Complaint ID',
    type: String,
  })
  @ApiOkResponse({
    type: ComplaintDto,
    description: 'Complaint rejected successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid complaint or already resolved',
  })
  public async rejectComplaint(
    @CurrentUser() user: User,
    @Param('id') complaintId: string,
    @Body() rejectComplaintDto: RejectComplaintDto,
  ): Promise<ComplaintDto> {
    const response = await this.rejectComplaintHandler.handle(
      rejectComplaintDto.toRequest(complaintId, user),
    );

    return ComplaintDto.fromEntity(response.complaint);
  }

  @Post(':id/review')
  @Auth([UserRole.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark complaint as reviewed',
    description: 'Mark a complaint as reviewed (admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Complaint ID',
    type: String,
  })
  @ApiOkResponse({
    type: ComplaintDto,
    description: 'Complaint marked as reviewed successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid complaint or not pending' })
  public async reviewComplaint(
    @Param('id') complaintId: string,
  ): Promise<ComplaintDto> {
    const response = await this.reviewComplaintHandler.handle({
      complaintId: complaintId as ComplaintId,
    });

    return ComplaintDto.fromEntity(response.complaint);
  }
}
