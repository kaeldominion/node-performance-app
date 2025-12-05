import {
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
  IsInt,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { TrainingLevel, TrainingGoal } from '@prisma/client';

export class UpdateUserProfileDto {
  @IsEnum(TrainingLevel)
  trainingLevel: TrainingLevel;

  @IsOptional()
  @IsEnum(TrainingGoal)
  primaryGoal?: TrainingGoal;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  // New profile fields
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number; // in kg

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number; // in cm

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

