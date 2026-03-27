import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectCategory, ProjectType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Projects Endpoints')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ description: 'Project created.' })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  @ApiOkResponse({ description: 'Paginated list of projects.' })
  @ApiQuery({ name: 'service', required: false, description: 'Service slug' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'featured', required: false, description: 'true/false' })
  @ApiQuery({ name: 'type', required: false, enum: ProjectType })
  @ApiQuery({ name: 'category', required: false, enum: ProjectCategory })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  list(
    @Query('service') service?: string,
    @Query('location') location?: string,
    @Query('featured') featured?: string,
    @Query('type') type?: ProjectType,
    @Query('category') category?: ProjectCategory,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.projectsService.list(
      {
        service,
        location,
        featured: featured === 'true' ? true : undefined,
        type,
        category,
      },
      page,
      limit,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a project by slug' })
  @ApiParam({ name: 'slug', example: 'modern-family-villa' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  getBySlug(@Param('slug') slug: string) {
    return this.projectsService.getBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  update(@Param('id') id: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a project' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  publish(@Param('id') id: string) {
    return this.projectsService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a project' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  unpublish(@Param('id') id: string) {
    return this.projectsService.unpublish(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all available project categories' })
  @ApiOkResponse({ 
    description: 'List of available project categories.',
    example: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL']
  })
  getCategories() {
    return this.projectsService.getCategories();
  }

  @Get('by-category/:category')
  @ApiOperation({ summary: 'Get projects by specific category' })
  @ApiParam({ 
    name: 'category', 
    enum: ProjectCategory,
    example: ProjectCategory.RESIDENTIAL 
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  getProjectsByCategory(
    @Param('category') category: ProjectCategory,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.projectsService.getProjectsByCategory(category, page, limit);
  }

  @Get('categories/:category/count')
  @ApiOperation({ summary: 'Get project count by category' })
  @ApiParam({ 
    name: 'category', 
    enum: ProjectCategory,
    example: ProjectCategory.RESIDENTIAL 
  })
  @ApiOkResponse({ 
    description: 'Project count for the specified category.',
    example: { category: 'RESIDENTIAL', count: 25 }
  })
  getProjectCountByCategory(@Param('category') category: ProjectCategory) {
    return this.projectsService.getProjectCountByCategory(category);
  }

  @Get('categories/summary')
  @ApiOperation({ summary: 'Get summary statistics for all categories' })
  @ApiOkResponse({ 
    description: 'Summary statistics including counts and percentages for all categories.',
    example: {
      categories: [
        { category: 'RESIDENTIAL', count: 25 },
        { category: 'COMMERCIAL', count: 15 },
        { category: 'INDUSTRIAL', count: 10 }
      ],
      total: 50,
      summary: [
        { category: 'RESIDENTIAL', count: 25, percentage: 50 },
        { category: 'COMMERCIAL', count: 15, percentage: 30 },
        { category: 'INDUSTRIAL', count: 10, percentage: 20 }
      ]
    }
  })
  getCategoriesSummary() {
    return this.projectsService.getCategoriesSummary();
  }
}
