import {
  IsEnum,
  IsArray,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { TrainingGoal, TrainingLevel, SectionType, WorkoutArchetype } from '@prisma/client';

export class GenerateWorkoutDto {
  @IsEnum(TrainingGoal)
  goal: TrainingGoal;

  @IsEnum(TrainingLevel)
  trainingLevel: TrainingLevel;

  @IsArray()
  @IsString({ each: true })
  equipment: string[];

  @IsInt()
  @Min(15)
  @Max(120)
  availableMinutes: number;

  @IsOptional()
  @IsArray()
  @IsEnum(SectionType, { each: true })
  sectionPreferences?: SectionType[];

  @IsOptional()
  @IsEnum(WorkoutArchetype)
  archetype?: WorkoutArchetype;

  @IsOptional()
  @IsString()
  workoutType?: 'single' | 'week' | 'month' | 'fourDay';

  @IsOptional()
  @IsEnum(['BASE', 'LOAD', 'INTENSIFY', 'DELOAD'])
  cycle?: 'BASE' | 'LOAD' | 'INTENSIFY' | 'DELOAD';

  @IsOptional()
  @IsBoolean()
  isHyrox?: boolean; // Flag for HYROX-style 90-minute conditioning workouts (single workouts only)

  @IsOptional()
  @IsBoolean()
  includeHyrox?: boolean; // Flag to include HYROX sessions in multi-day programs
}

