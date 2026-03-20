import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CareersService } from './careers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Careers Endpoints')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiCreatedResponse({ description: 'Job created successfully.' })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  create(@Body() dto: CreateJobDto) {
    return this.careersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List published jobs (public) or all jobs (admin)' })
  @ApiOkResponse({ description: 'Paginated list of jobs.' })
  @ApiQuery({ name: 'location', required: false, example: 'Lagos' })
  @ApiQuery({ name: 'department', required: false, example: 'Engineering' })
  @ApiQuery({ name: 'type', required: false, example: 'Full-time' })
  @ApiQuery({ name: 'published', required: false, description: 'Filter by published status (admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiBadRequestResponse({ description: 'Validation error (invalid pagination).' })
  async list(
    @Query('location') location?: string,
    @Query('department') department?: string,
    @Query('type') type?: string,
    @Query('published') published?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const publishedFilter = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.careersService.list(
      { location, department, type, published: publishedFilter },
      Number(page),
      Number(limit),
    );
  }

  @Get('public')
  @ApiOperation({ summary: 'List only published jobs (legacy endpoint)' })
  @ApiOkResponse({ description: 'Paginated list of published jobs.' })
  @ApiQuery({ name: 'location', required: false, example: 'Lagos' })
  @ApiQuery({ name: 'department', required: false, example: 'Engineering' })
  @ApiQuery({ name: 'type', required: false, example: 'Full-time' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiBadRequestResponse({ description: 'Validation error (invalid pagination).' })
  async listPublished(
    @Query('location') location?: string,
    @Query('department') department?: string,
    @Query('type') type?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page, pageSize, skip, take } = getPagination(pagination ?? {});
    const result = await this.careersService.listPublished(
      { location, department, type },
      { skip, take },
    );
    return { ...result, page, pageSize };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job statistics (admin)' })
  @ApiOkResponse({ description: 'Job statistics by department, location, and type.' })
  getStats() {
    return this.careersService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job by ID (admin)' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Job details with application count.' })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get job details by slug (public)' })
  @ApiOkResponse({ description: 'Published job detail.' })
  @ApiParam({ name: 'slug', example: 'senior-structural-engineer' })
  @ApiBadRequestResponse({ description: 'Invalid slug.' })
  getBySlug(@Param('slug') slug: string) {
    return this.careersService.getBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job posting' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Job updated successfully.' })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  update(@Param('id') id: string, @Body() dto: CreateJobDto) {
    return this.careersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job posting' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Job deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a job posting' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Job published successfully.' })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  publish(@Param('id') id: string) {
    return this.careersService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a job posting' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Job unpublished successfully.' })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  unpublish(@Param('id') id: string) {
    return this.careersService.unpublish(id);
  }
}
