import { Body, Controller, Get, Post, Put, Delete, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiProperty,
  ApiBearerAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';
import { IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobApplicationStatus } from '@prisma/client';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { BulkUpdateApplicationsDto } from './dto/bulk-update-applications.dto';

class CreateApplicationDto {
  @IsString()
  @ApiProperty({ example: '65f34e7e0a2b3c4d5e6f7890' })
  jobId: string;

  @IsString()
  @ApiProperty({ example: 'Ada Lovelace' })
  fullName: string;

  @IsEmail()
  @ApiProperty({ example: 'ada@example.com' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '+2348012345678' })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'I am excited to apply...' })
  coverLetter?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'https://cdn.example.com/cv/ada-lovelace.pdf',
  })
  cvUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'cvs/ada-lovelace.pdf' })
  cvS3Key?: string;
}

class DateRangeQueryDto {
  @IsDateString()
  @ApiProperty({ example: '2024-01-01' })
  startDate: string;

  @IsDateString()
  @ApiProperty({ example: '2024-12-31' })
  endDate: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '65f34e7e0a2b3c4d5e6f7890' })
  jobId?: string;
}

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a job application' })
  @ApiCreatedResponse({ description: 'Created job application.' })
  @ApiBadRequestResponse({
    description: 'Validation error (missing/invalid fields).',
  })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all applications with advanced filtering (admin)' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Filter by specific job' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Job application status',
    enum: JobApplicationStatus,
  })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by job department' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by job location' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by applicant name or email' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Paginated list of applications.' })
  @ApiBadRequestResponse({
    description: 'Validation error (invalid pagination).',
  })
  async list(
    @Query('jobId') jobId?: string,
    @Query('status') status?: JobApplicationStatus,
    @Query('department') department?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.applicationsService.list(
      { jobId, status, department, location, search },
      Number(page),
      Number(limit),
    );
  }

  @Get('for-job')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List applications for a specific job (legacy endpoint)' })
  @ApiQuery({ name: 'jobId', required: true })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Job application status or ALL',
    enum: JobApplicationStatus,
  })
  @ApiOkResponse({ description: 'Paginated list of applications.' })
  @ApiBadRequestResponse({
    description: 'Validation error (missing jobId or invalid pagination).',
  })
  async listForJob(
    @Query('jobId') jobId: string,
    @Query('status') status?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page, pageSize, skip, take } = getPagination(pagination ?? {});
    const mappedStatus =
      status && status.toUpperCase() !== 'ALL'
        ? (status.toUpperCase() as any)
        : undefined;
    const result = await this.applicationsService.listForJob(jobId, mappedStatus, {
      skip,
      take,
    });
    return { ...result, page, pageSize };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application statistics (admin)' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Get stats for specific job' })
  @ApiOkResponse({ description: 'Application statistics by status and job.' })
  getStats(@Query('jobId') jobId?: string) {
    return this.applicationsService.getStats(jobId);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export applications to CSV/JSON (admin)' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Export for specific job' })
  @ApiQuery({ name: 'status', required: false, enum: JobApplicationStatus })
  @ApiOkResponse({ description: 'All applications matching criteria.' })
  exportApplications(
    @Query('jobId') jobId?: string,
    @Query('status') status?: JobApplicationStatus,
  ) {
    return this.applicationsService.exportApplications(jobId, status);
  }

  @Get('date-range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications within date range (admin)' })
  @ApiOkResponse({ description: 'Applications within specified date range.' })
  getByDateRange(@Query() query: DateRangeQueryDto) {
    return this.applicationsService.getApplicationsByDateRange(
      new Date(query.startDate),
      new Date(query.endDate),
      query.jobId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application by ID (admin)' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Application details with job information.' })
  @ApiNotFoundResponse({ description: 'Application not found.' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status and notes (admin)' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Application updated successfully.' })
  @ApiNotFoundResponse({ description: 'Application not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationsService.update(id, dto);
  }

  @Put('bulk-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update application status (admin)' })
  @ApiOkResponse({ description: 'Applications updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid application IDs.' })
  bulkUpdate(@Body() dto: BulkUpdateApplicationsDto) {
    return this.applicationsService.bulkUpdate(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an application (admin)' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Application deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Application not found.' })
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}


