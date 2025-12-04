import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateCoachClientDto {
  @IsString()
  clientId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'PAUSED', 'COMPLETED'])
  status?: string;
}

