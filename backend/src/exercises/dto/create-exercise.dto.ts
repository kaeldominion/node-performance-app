import {
  IsString,
  IsArray,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ExerciseCategory,
  MovementPattern,
  SpaceRequirement,
  ImpactLevel,
  TypicalUse,
  WorkoutArchetype,
  Tier,
} from '@prisma/client';

export class ExerciseTierDto {
  @IsEnum(Tier)
  tier: Tier;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  typicalReps?: string;
}

export class CreateExerciseDto {
  @IsString()
  exerciseId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @IsEnum(MovementPattern)
  movementPattern: MovementPattern;

  @IsArray()
  @IsString({ each: true })
  primaryMuscles: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMuscles?: string[];

  @IsArray()
  @IsString({ each: true })
  equipment: string[];

  @IsEnum(SpaceRequirement)
  space: SpaceRequirement;

  @IsEnum(ImpactLevel)
  impactLevel: ImpactLevel;

  @IsArray()
  @IsEnum(TypicalUse, { each: true })
  typicalUse: TypicalUse[];

  @IsArray()
  @IsEnum(WorkoutArchetype, { each: true })
  suitableArchetypes: WorkoutArchetype[];

  @IsOptional()
  @IsBoolean()
  indoorFriendly?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseTierDto)
  tiers?: ExerciseTierDto[];
  
  // New fields for reference/how-to guide
  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  variations?: any; // JSON field for exercise variations

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  graphics?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commonMistakes?: string[];

  @IsOptional()
  @IsString()
  progressionTips?: string;

  @IsOptional()
  @IsString()
  regressionTips?: string;

  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;

  @IsOptional()
  usageCount?: number;
}

