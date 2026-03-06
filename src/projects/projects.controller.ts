/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ProjectCategory, ProjectType } from '@prisma/client';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({
    description: 'The created project has been successfully saved.',
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'List public projects' })
  @ApiOkResponse({
    description:
      'Paginated list of public projects with images and pricing tiers.',
  })
  @ApiQuery({
    name: 'service',
    required: false,
    description: 'Filter by primary Service slug (e.g. architectural-design)',
  })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'featured', required: false, description: 'true/false' })
  @ApiQuery({ name: 'type', required: false, enum: ProjectType })
  @ApiQuery({ name: 'category', required: false, enum: ProjectCategory })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  async list(
    @Query('service') service?: string,
    @Query('location') location?: string,
    @Query('featured') featured?: string,
    @Query('type') type?: ProjectType,
    @Query('category') category?: ProjectCategory,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const filters = {
      service,
      location,
      featured: featured === 'true' ? true : undefined,
      type,
      category,
    };
    const result = await this.projectsService.list(filters, page, pageSize);
    return result;
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a project by slug' })
  @ApiOkResponse({
    description:
      'Project details including images, pricing tiers, and downloadable assets.',
  })
  @ApiParam({ name: 'slug', example: 'modern-family-villa' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  getBySlug(@Param('slug') slug: string) {
    return this.projectsService.getBySlug(slug);
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiOkResponse({
    description:
      'Project details including images, pricing tiers, and downloadable assets.',
  })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiOkResponse({
    description: 'The project has been successfully updated.',
  })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  update(@Param('id') id: string, @Body() updateProjectDto: CreateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiOkResponse({
    description: 'The project has been successfully deleted.',
  })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a project by ID' })
  @ApiOkResponse({
    description: 'The project has been successfully published.',
  })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  publish(@Param('id') id: string) {
    return this.projectsService.publish(id);
  }
}
