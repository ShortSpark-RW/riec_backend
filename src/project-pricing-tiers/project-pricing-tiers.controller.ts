import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth,
  ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProjectPricingTiersService } from './project-pricing-tiers.service';
import { CreatePriceTierDto } from './dto/create-price-tier.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('project-pricing-tiers')
@Controller('projects/:projectId/tiers')
export class ProjectPricingTiersController {
  constructor(private readonly service: ProjectPricingTiersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a pricing tier for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiCreatedResponse({ description: 'Pricing tier created.' })
  create(@Param('projectId') projectId: string, @Body() dto: CreatePriceTierDto) {
    return this.service.create(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List pricing tiers for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiQuery({ name: 'onlyActive', required: false, description: 'true/false' })
  @ApiOkResponse({ description: 'List of pricing tiers with their linked assets.' })
  list(@Param('projectId') projectId: string, @Query('onlyActive') onlyActive?: string) {
    return this.service.list(projectId, onlyActive === 'true');
  }

  @Get(':tierId')
  @ApiOperation({ summary: 'Get a single pricing tier' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'tierId', example: '65f34e7e0a2b3c4d5e6f7892' })
  @ApiOkResponse({ description: 'Pricing tier details.' })
  @ApiNotFoundResponse({ description: 'Pricing tier not found.' })
  findOne(@Param('projectId') projectId: string, @Param('tierId') tierId: string) {
    return this.service.findOne(projectId, tierId);
  }

  @Put(':tierId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pricing tier' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'tierId', example: '65f34e7e0a2b3c4d5e6f7892' })
  @ApiOkResponse({ description: 'Pricing tier updated.' })
  @ApiNotFoundResponse({ description: 'Pricing tier not found.' })
  update(
    @Param('projectId') projectId: string,
    @Param('tierId') tierId: string,
    @Body() dto: CreatePriceTierDto,
  ) {
    return this.service.update(projectId, tierId, dto);
  }

  @Delete(':tierId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a pricing tier' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'tierId', example: '65f34e7e0a2b3c4d5e6f7892' })
  @ApiOkResponse({ description: 'Pricing tier deleted.' })
  @ApiNotFoundResponse({ description: 'Pricing tier not found.' })
  remove(@Param('projectId') projectId: string, @Param('tierId') tierId: string) {
    return this.service.remove(projectId, tierId);
  }
}
