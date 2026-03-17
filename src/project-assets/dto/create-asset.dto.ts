import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectDocumentType } from '@prisma/client';

export class CreateAssetDto {
  @IsEnum(ProjectDocumentType)
  @ApiProperty({ enum: ProjectDocumentType, example: 'PRESENTATION' })
  documentType: ProjectDocumentType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'tierId123' })
  tierId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'v1' })
  version?: string;
}
