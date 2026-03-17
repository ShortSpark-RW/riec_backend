import {
  Controller, Get, Post, Put, Delete, Param, Body,
  UploadedFiles, UseInterceptors, UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody,
  ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectImagesService } from './project-images.service';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('project-images')
@Controller('projects/:projectId/images')
export class ProjectImagesController {
  constructor(private readonly service: ProjectImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        captions: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Images uploaded.' })
  upload(
    @Param('projectId') projectId: string,
    @UploadedFiles() files: any[],
    @Body('captions') captions?: string | string[],
  ) {
    const captionsArr = captions
      ? Array.isArray(captions) ? captions : [captions]
      : undefined;
    return this.service.upload(projectId, files, captionsArr);
  }

  @Get()
  @ApiOperation({ summary: 'List images for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'List of project images ordered by position.' })
  list(@Param('projectId') projectId: string) {
    return this.service.list(projectId);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder project images' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } } } })
  @ApiOkResponse({ description: 'Images reordered.' })
  reorder(@Param('projectId') projectId: string, @Body('ids') ids: string[]) {
    return this.service.reorder(projectId, ids);
  }

  @Put(':imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update image caption or order' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'imageId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Image updated.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  update(
    @Param('projectId') projectId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateImageDto,
  ) {
    return this.service.update(projectId, imageId, dto);
  }

  @Delete(':imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project image' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'imageId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Image deleted.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  remove(@Param('projectId') projectId: string, @Param('imageId') imageId: string) {
    return this.service.remove(projectId, imageId);
  }
}
