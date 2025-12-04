import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateCoachProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  instagram?: string;
}

