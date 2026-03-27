import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a service' })
  @ApiCreatedResponse({ description: 'Service created.' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all services with their images' })
  @ApiOkResponse({ description: 'Paginated list of services.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.servicesService.list(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID with related projects' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Service with images and related projects.' })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Service updated.' })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  update(@Param('id') id: string, @Body() dto: CreateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'Service deleted.' })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
