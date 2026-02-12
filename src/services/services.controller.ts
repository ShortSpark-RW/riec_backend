import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List services' })
  @ApiOkResponse({ description: 'Paginated list of services.' })
  async list(@Query() pagination?: PaginationDto) {
    const { page, pageSize, skip, take } = getPagination(pagination ?? {});
    const result = await this.servicesService.listPublic({ skip, take });
    return { ...result, page, pageSize };
  }
}


