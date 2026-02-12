import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @IsString()
  @MaxLength(200)
  @ApiProperty({ example: 'New Project', maxLength: 200 })
  title: string;

  @IsString()
  @MaxLength(200)
  @ApiProperty({ example: 'new-project', maxLength: 200 })
  slug: string;

  @IsString()
  @ApiProperty({ example: 'A concise description of the project' })
  description: string;

  @IsString()
  @ApiProperty({ example: 'Lagos, Nigeria' })
  location: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: ['architecture', 'interiors'] })
  services: string[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  purchasable?: boolean;
}


