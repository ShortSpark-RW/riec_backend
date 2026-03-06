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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiOkResponse({
    description: 'The created project has been successfully saved.',
  })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'List public projects' })
  @ApiOkResponse({
    description:
      'Paginated list of public projects with images and pricing tiers.',
  })
  @ApiQuery({ name: 'service', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'featured', required: false, description: 'true/false' })
  async list(
    @Query('service') service?: string,
    @Query('location') location?: string,
    @Query('featured') featured?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page, pageSize } = pagination ?? { page: 1, pageSize: 20 };
    const filters = {
      service,
      location,
      featured: featured === 'true' ? true : undefined,
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
  getBySlug(@Param('slug') slug: string) {
    return this.projectsService.getBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiOkResponse({
    description:
      'Project details including images, pricing tiers, and downloadable assets.',
  })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiOkResponse({
    description: 'The project has been successfully updated.',
  })
  update(@Param('id') id: string, @Body() updateProjectDto: CreateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiOkResponse({
    description: 'The project has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a project by ID' })
  @ApiOkResponse({
    description: 'The project has been successfully published.',
  })
  publish(@Param('id') id: string) {
    return this.projectsService.publish(id);
  }
}
