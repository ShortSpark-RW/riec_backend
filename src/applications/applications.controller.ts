import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { JobApplicationStatus } from '@prisma/client';

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

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a job application' })
  @ApiOkResponse({ description: 'Created job application.' })
  @ApiBadRequestResponse({
    description: 'Validation error (missing/invalid fields).',
  })
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
}


