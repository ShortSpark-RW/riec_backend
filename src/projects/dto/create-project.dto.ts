import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProjectCategory, ProjectType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Modern Family Villa' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'modern-family-villa',
    description: 'URL-friendly unique identifier',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'Lekki, Lagos, Nigeria',
    description: 'Project location (city/region/country)',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    example: 'architectural-design',
    description: 'Slug of the primary service for this project',
  })
  @IsOptional()
  @IsString()
  serviceSlug?: string;

  @ApiProperty({ enum: ProjectType, example: ProjectType.COMPLETED })
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiProperty({
    enum: ProjectCategory,
    example: ProjectCategory.RESIDENTIAL,
  })
  @IsEnum(ProjectCategory)
  category: ProjectCategory;

  @ApiProperty({ example: 'A contemporary villa designed for comfort.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  purchasable?: boolean;
}
