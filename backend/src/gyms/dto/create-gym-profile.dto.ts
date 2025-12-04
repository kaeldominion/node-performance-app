import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateGymProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}

