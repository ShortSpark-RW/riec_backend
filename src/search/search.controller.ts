import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search Endpoints')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all entities' })
  @ApiQuery({ name: 'q', required: true, example: 'architectural design', description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: ['projects', 'services', 'jobs', 'applications'], description: 'Filter by entity type' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Global search results across all entities.' })
  @ApiBadRequestResponse({ description: 'Missing or invalid search query.' })
  globalSearch(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.globalSearch(query, type, Number(page), Number(limit));
  }

  @Get('projects')
  @ApiOperation({ summary: 'Search projects' })
  @ApiQuery({ name: 'q', required: true, example: 'villa residential', description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'] })
  @ApiQuery({ name: 'type', required: false, enum: ['COMPLETED', 'PLAN_TO_BUY'] })
  @ApiQuery({ name: 'location', required: false, example: 'Lagos' })
  @ApiQuery({ name: 'featured', required: false, description: 'true/false' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Project search results.' })
  searchProjects(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('featured') featured?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchProjects(query, {
      category,
      type,
      location,
      featured: featured === 'true' ? true : undefined,
    }, Number(page), Number(limit));
  }

  @Get('services')
  @ApiOperation({ summary: 'Search services' })
  @ApiQuery({ name: 'q', required: true, example: 'architectural design', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Service search results.' })
  searchServices(
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchServices(query, Number(page), Number(limit));
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Search jobs' })
  @ApiQuery({ name: 'q', required: true, example: 'structural engineer', description: 'Search query' })
  @ApiQuery({ name: 'department', required: false, example: 'Engineering' })
  @ApiQuery({ name: 'location', required: false, example: 'Lagos' })
  @ApiQuery({ name: 'employmentType', required: false, example: 'Full-time' })
  @ApiQuery({ name: 'published', required: false, description: 'true/false' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Job search results.' })
  searchJobs(
    @Query('q') query: string,
    @Query('department') department?: string,
    @Query('location') location?: string,
    @Query('employmentType') employmentType?: string,
    @Query('published') published?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchJobs(query, {
      department,
      location,
      employmentType,
      published: published === 'true' ? true : undefined,
    }, Number(page), Number(limit));
  }

  @Get('applications')
  @ApiOperation({ summary: 'Search job applications' })
  @ApiQuery({ name: 'q', required: true, example: 'john doe', description: 'Search query' })
  @ApiQuery({ name: 'status', required: false, enum: ['NEW', 'IN_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED'] })
  @ApiQuery({ name: 'jobId', required: false, example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Application search results.' })
  searchApplications(
    @Query('q') query: string,
    @Query('status') status?: string,
    @Query('jobId') jobId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.searchService.searchApplications(query, {
      status,
      jobId,
    }, Number(page), Number(limit));
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true, example: 'arch', description: 'Search query for suggestions' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiOkResponse({ description: 'Search suggestions.' })
  getSuggestions(
    @Query('q') query: string,
    @Query('limit') limit = 5,
  ) {
    return this.searchService.searchSuggestions(query, Number(limit));
  }
}