import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
    const { page, pageSize, skip, take } = getPagination(pagination ?? {});
    const filters = {
      service,
      location,
      featured: featured === 'true' ? true : undefined,
    };
    const result = await this.projectsService.listPublic(filters, {
      skip,
      take,
    });
    return { ...result, page, pageSize };
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
}


