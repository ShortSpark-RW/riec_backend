import {
  Controller, Get, Post, Put, Delete, Param, Body,
  UploadedFiles, UseInterceptors, UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody, ApiBearerAuth,
  ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ServiceImagesService } from './service-images.service';
import { UpdateServiceImageDto } from './dto/update-service-image.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('service-images')
@Controller('services/:serviceId/images')
export class ServiceImagesController {
  constructor(private readonly service: ServiceImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images for a service' })
  @ApiParam({ name: 'serviceId', example: '65f34e7e0a2b3c4d5e6f7890' })
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
  @ApiNotFoundResponse({ description: 'Service not found.' })
  upload(
    @Param('serviceId') serviceId: string,
    @UploadedFiles() files: any[],
    @Body('captions') captions?: string | string[],
  ) {
    const captionsArr = captions
      ? Array.isArray(captions) ? captions : [captions]
      : undefined;
    return this.service.upload(serviceId, files, captionsArr);
  }

  @Get()
  @ApiOperation({ summary: 'List images for a service' })
  @ApiParam({ name: 'serviceId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'List of service images ordered by position.' })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  list(@Param('serviceId') serviceId: string) {
    return this.service.list(serviceId);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder service images' })
  @ApiParam({ name: 'serviceId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } } } })
  @ApiOkResponse({ description: 'Images reordered.' })
  reorder(@Param('serviceId') serviceId: string, @Body('ids') ids: string[]) {
    return this.service.reorder(serviceId, ids);
  }

  @Put(':imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update image caption or order' })
  @ApiParam({ name: 'serviceId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'imageId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Image updated.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  update(
    @Param('serviceId') serviceId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateServiceImageDto,
  ) {
    return this.service.update(serviceId, imageId, dto);
  }

  @Delete(':imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service image' })
  @ApiParam({ name: 'serviceId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'imageId', example: '65f34e7e0a2b3c4d5e6f7891' })
  @ApiOkResponse({ description: 'Image deleted.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  remove(@Param('serviceId') serviceId: string, @Param('imageId') imageId: string) {
    return this.service.remove(serviceId, imageId);
  }
}
