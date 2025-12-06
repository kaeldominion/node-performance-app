import { IsOptional, IsInt, IsBoolean, IsString, Min, Max } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsInt()
  durationSec?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metrics?: any;

  @IsOptional()
  @IsBoolean()
  bypassValidation?: boolean; // For coaches/admins to bypass completion requirements
}

