/* eslint-disable prettier/prettier */
import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UploadedFiles, UseInterceptors, Req, UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody, ApiQuery, ApiBearerAuth,
  ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProjectAssetsService } from './project-assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ProjectDocumentType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Project Assets (Project related Documents) Endpoints')
@Controller('projects/:projectId/assets')
export class ProjectAssetsController {
  constructor(private readonly service: ProjectAssetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload one or more assets for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        documentType: { type: 'string', enum: Object.values(ProjectDocumentType) },
        tierId: { type: 'string' },
        version: { type: 'string', example: 'v1' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Assets uploaded.' })
  upload(
    @Param('projectId') projectId: string,
    @UploadedFiles() files: any[],
    @Body() dto: CreateAssetDto,
    @Req() req: any,
  ) {
    const userId: string | undefined = req.user?.userId ?? req.user?.sub;
    return this.service.upload(projectId, files, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List assets for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiQuery({ name: 'tierId', required: false })
  @ApiQuery({ name: 'documentType', required: false, enum: ProjectDocumentType })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Paginated list of project assets.' })
  list(
    @Param('projectId') projectId: string,
    @Query('tierId') tierId?: string,
    @Query('documentType') documentType?: ProjectDocumentType,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.list(projectId, { tierId, documentType }, Number(page), Number(limit));
  }

  @Get(':assetId')
  @ApiOperation({ summary: 'Get a single asset' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'assetId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Asset details.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  findOne(@Param('projectId') projectId: string, @Param('assetId') assetId: string) {
    return this.service.findOne(projectId, assetId);
  }

  @Put(':assetId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update asset metadata (isDownloadable, version)' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'assetId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Asset updated.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  update(
    @Param('projectId') projectId: string,
    @Param('assetId') assetId: string,
    @Body() body: { isDownloadable?: boolean; version?: string },
  ) {
    return this.service.update(projectId, assetId, body);
  }

  @Delete(':assetId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project asset' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'assetId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Asset deleted.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  remove(@Param('projectId') projectId: string, @Param('assetId') assetId: string) {
    return this.service.remove(projectId, assetId);
  }

  @Get(':assetId/download')
  @ApiOperation({ summary: 'Get a signed download URL for an asset' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'assetId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Signed download URL.' })
  @ApiNotFoundResponse({ description: 'Asset not found.' })
  download(@Param('projectId') projectId: string, @Param('assetId') assetId: string) {
    return this.service.getDownloadUrl(projectId, assetId);
  }
}
