import { Controller, Get, Post, Put, Body, Param, UseGuards, Patch, Delete, Request } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('workouts')
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Get('recommended')
  async findRecommended() {
    return this.workoutsService.findRecommended();
  }

  @Get('my-workouts')
  @UseGuards(ClerkAuthGuard)
  async findMyWorkouts(@Request() req: any) {
    return this.workoutsService.findByUser(req.user.id);
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

  @Delete(':id')
  @UseGuards(ClerkAuthGuard)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.delete(req.user.id, id);
  }

  @Post(':id/share')
  @UseGuards(ClerkAuthGuard)
  async generateShareLink(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.generateShareLink(req.user.id, id);
  }
}

