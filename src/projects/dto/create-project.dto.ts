import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProjectDocumentType } from '@prisma/client';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(ProjectDocumentType)
  documentType?: ProjectDocumentType;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  publishedAt?: Date;
}
