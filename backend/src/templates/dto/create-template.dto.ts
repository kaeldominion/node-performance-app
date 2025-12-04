import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { WorkoutArchetype } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(WorkoutArchetype)
  archetype: WorkoutArchetype;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  structure: any; // JSON structure defining the archetype rules

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

