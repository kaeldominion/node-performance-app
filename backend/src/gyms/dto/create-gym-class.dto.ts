import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateGymClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workoutId?: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  duration?: number; // minutes

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsInt()
  maxCapacity?: number;

  @IsOptional()
  @IsString()
  instructorId?: string;
}

