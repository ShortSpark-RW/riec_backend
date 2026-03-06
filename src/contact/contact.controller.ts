import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';

class ContactDto {
  @IsString()
  @ApiProperty({ example: 'Grace Hopper' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'grace@example.com' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '+2348012345678' })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'RIEC Ltd.' })
  company?: string;

  @IsString()
  @MaxLength(2000)
  @ApiProperty({ example: 'Hello, I would like to request a quote...' })
  message: string;
}

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiOkResponse({ description: 'Created contact submission.' })
  @ApiBadRequestResponse({
    description: 'Validation error (missing/invalid fields).',
  })
  create(@Body() dto: ContactDto) {
    return this.prisma.contactSubmission.create({ data: dto });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/submissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List contact submissions (admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Paginated list of contact submissions.',
  })
  @ApiBadRequestResponse({
    description: 'Validation error (invalid pagination).',
  })
  async list(@Query() pagination?: PaginationDto) {
    const { page, pageSize, skip, take } = getPagination(pagination ?? {});
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.contactSubmission.count(),
    ]);
    return { data: items, total, page, pageSize };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/submissions/:id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a contact submission as read (admin)' })
  @ApiParam({ name: 'id', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiBadRequestResponse({ description: 'Invalid submission id.' })
  markRead(@Param('id') id: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { read: true },
    });
  }
}


