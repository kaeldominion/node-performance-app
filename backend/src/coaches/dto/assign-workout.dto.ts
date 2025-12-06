import { IsString, IsOptional, IsDateString } from 'class-validator';

export class AssignWorkoutDto {
  @IsString()
  workoutId: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
