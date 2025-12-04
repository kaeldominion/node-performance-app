import {
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
  IsInt,
  Min,
  Max,
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
}

