import { IsString, IsEnum, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export enum FeedbackType {
  BUG_REPORT = 'BUG_REPORT',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  GENERAL_FEEDBACK = 'GENERAL_FEEDBACK',
  UI_UX_FEEDBACK = 'UI_UX_FEEDBACK',
  PERFORMANCE_ISSUE = 'PERFORMANCE_ISSUE',
  OTHER = 'OTHER',
}

export class CreateFeedbackDto {
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;

  @IsString()
  @IsOptional()
  pageUrl?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsOptional()
  metadata?: any;
}

