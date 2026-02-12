import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getPagination } from '../common/utils/pagination.util';

class ContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  @MaxLength(2000)
  message: string;
}

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiOkResponse({ description: 'Created contact submission.' })
  create(@Body() dto: ContactDto) {
    return this.prisma.contactSubmission.create({ data: dto });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/submissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List contact submissions (admin)' })
  @ApiOkResponse({
    description: 'Paginated list of contact submissions.',
  })
  async list(pagination?: PaginationDto) {
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
  markRead(@Param('id') id: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { read: true },
    });
  }
}


