import { Controller, Get, Post, Put, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';

@Controller('workouts')
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Get('recommended')
  async findRecommended() {
    return this.workoutsService.findRecommended();
  }

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

  @Patch(':id/recommended')
  @UseGuards(ClerkAdminGuard)
  async toggleRecommended(@Param('id') id: string, @Body() body: { isRecommended: boolean }) {
    return this.workoutsService.toggleRecommended(id, body.isRecommended);
  }
}

