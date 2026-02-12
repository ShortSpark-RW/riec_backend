import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadAssetDto {
  @IsString()
  @ApiProperty({ example: 'projectId123' })
  projectId: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'tierId123' })
  tierId?: string;

  @IsString()
  @ApiProperty({ example: 'PRESENTATION' })
  documentType: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'v1' })
  version?: string;
}
