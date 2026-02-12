import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';
import { IsEmail, IsOptional, IsString } from 'class-validator';

class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsOptional()
  @IsString()
  cvS3Key?: string;
}

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a job application' })
  @ApiOkResponse({ description: 'Created job application.' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List applications for a job' })
  @ApiQuery({ name: 'jobId', required: true })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Job application status or ALL',
  })
  @ApiOkResponse({ description: 'Paginated list of applications.' })
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
}


