import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CareersService } from './careers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';

@ApiTags('careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'List published jobs' })
  @ApiOkResponse({ description: 'Paginated list of published jobs.' })
  @ApiQuery({ name: 'location', required: false, example: 'Lagos' })
  @ApiQuery({ name: 'department', required: false, example: 'Engineering' })
  @ApiQuery({ name: 'type', required: false, example: 'Full-time' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiBadRequestResponse({
    description: 'Validation error (invalid pagination).',
  })
  async list(
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

  @Get(':slug')
  @ApiOperation({ summary: 'Get job details by slug' })
  @ApiOkResponse({ description: 'Published job detail.' })
  @ApiParam({ name: 'slug', example: 'senior-structural-engineer' })
  @ApiBadRequestResponse({ description: 'Invalid slug.' })
  getBySlug(@Param('slug') slug: string) {
    return this.careersService.getBySlug(slug);
  }
}


