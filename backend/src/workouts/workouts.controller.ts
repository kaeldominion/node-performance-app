import { Controller, Get, Post, Put, Body, Param, UseGuards, Patch, Delete, Request, Query } from '@nestjs/common';
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

  @Get('admin-all')
  @UseGuards(ClerkAdminGuard)
  async findAllAdmin(@Request() req: any, @Query() query: any) {
    console.log('Admin workouts endpoint called');
    console.log('Query params:', query);
    console.log('User:', req.user);
    
    const filterParams: any = {};
    
    if (query.search) filterParams.search = query.search;
    if (query.createdBy) filterParams.createdBy = query.createdBy;
    if (query.archetype) filterParams.archetype = query.archetype;
    if (query.isRecommended !== undefined) filterParams.isRecommended = query.isRecommended === 'true';
    if (query.startDate) filterParams.startDate = new Date(query.startDate);
    if (query.endDate) filterParams.endDate = new Date(query.endDate);
    if (query.isHyrox !== undefined) filterParams.isHyrox = query.isHyrox === 'true';
    
    console.log('Filter params:', filterParams);
    const result = await this.workoutsService.findAll(filterParams);
    console.log(`Returning ${result.length} workouts`);
    return result;
  }

  @Get('share/:shareId')
  async findByShareId(@Param('shareId') shareId: string) {
    return this.workoutsService.findByShareId(shareId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workoutsService.findOne(id);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(@Request() req: any, @Body() createWorkoutDto: any) {
    return this.workoutsService.create(req.user.id, createWorkoutDto, req.user.email);
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

