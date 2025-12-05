import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';

@Controller('ai')
@UseGuards(ClerkAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-workout')
  async generateWorkout(@Body() generateWorkoutDto: GenerateWorkoutDto) {
    try {
      console.log('🚀 Starting workout generation with params:', {
        goal: generateWorkoutDto.goal,
        trainingLevel: generateWorkoutDto.trainingLevel,
        equipment: generateWorkoutDto.equipment,
        availableMinutes: generateWorkoutDto.availableMinutes,
        workoutType: generateWorkoutDto.workoutType,
        archetype: generateWorkoutDto.archetype,
        cycle: generateWorkoutDto.cycle,
        isHyrox: generateWorkoutDto.isHyrox,
        includeHyrox: generateWorkoutDto.includeHyrox,
      });
      return await this.aiService.generateWorkout(generateWorkoutDto);
    } catch (error: any) {
      console.error('AI Controller error:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        response: error?.response?.data,
        stack: error?.stack,
      });
      
      // If it's a validation error, provide more details
      if (error?.response?.message && Array.isArray(error.response.message)) {
        const validationErrors = error.response.message.join(', ');
        throw new HttpException(
          {
            message: `Validation failed: ${validationErrors}`,
            error: 'Validation Error',
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      // Return appropriate HTTP status based on error type
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error?.message || 'Failed to generate workout';
      
      throw new HttpException(
        {
          message,
          error: 'Workout Generation Failed',
          statusCode: status,
        },
        status,
      );
    }
  }

  @Post('test-openai')
  @UseGuards(ClerkAuthGuard)
  async testOpenAI() {
    try {
      return await this.aiService.testOpenAI();
    } catch (error: any) {
      throw new HttpException(
        {
          message: error?.message || 'OpenAI test failed',
          error: 'OpenAI Test Failed',
          statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

