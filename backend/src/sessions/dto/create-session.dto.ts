import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  workoutId: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;
}

