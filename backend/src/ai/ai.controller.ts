import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';

@Controller('ai')
@UseGuards(ClerkAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-workout')
  async generateWorkout(@Body() generateWorkoutDto: GenerateWorkoutDto) {
    return this.aiService.generateWorkout(generateWorkoutDto);
  }
}

