import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';

@Controller('workouts')
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workoutsService.findOne(id);
  }

  @Get('share/:shareId')
  async findByShareId(@Param('shareId') shareId: string) {
    return this.workoutsService.findByShareId(shareId);
  }

  @Post()
  async create(@Body() createWorkoutDto: any) {
    return this.workoutsService.create(createWorkoutDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateWorkoutDto: any) {
    // TODO: Implement update
    return { message: 'Update not implemented yet' };
  }
}

