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

  @Delete('admin/:id')
  @UseGuards(ClerkAdminGuard)
  async deleteAdmin(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.deleteAdmin(id);
  }

  @Delete(':id')
  @UseGuards(ClerkAuthGuard)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.delete(req.user.id, id);
  }

  @Post(':id/share')
  @UseGuards(ClerkAuthGuard)
  async generateShareLink(@Request() req: any, @Param('id') id: string) {
    try {
      return await this.workoutsService.generateShareLink(req.user.id, id);
    } catch (error: any) {
      console.error('Error in generateShareLink controller:', error);
      throw error;
    }
  }

  @Post(':id/ratings')
  @UseGuards(ClerkAuthGuard)
  async createRating(
    @Request() req: any,
    @Param('id') workoutId: string,
    @Body() body: {
      sessionLogId?: string;
      starRating: number;
      difficultyRating?: number;
      enjoymentRating?: number;
      effectivenessRating?: number;
      wouldDoAgain?: boolean;
      tags?: string[];
      notes?: string;
      favoriteExercises?: string[];
    },
  ) {
    return this.workoutsService.createRating(
      req.user.id,
      workoutId,
      body.sessionLogId || null,
      body,
    );
  }

  @Get(':id/ratings')
  async getRatings(@Param('id') workoutId: string) {
    return this.workoutsService.getRatings(workoutId);
  }

  @Get(':id/ratings/user')
  @UseGuards(ClerkAuthGuard)
  async getUserRating(@Request() req: any, @Param('id') workoutId: string) {
    return this.workoutsService.getUserRating(req.user.id, workoutId);
  }

  @Get('top-rated')
  async getTopRated(@Query('limit') limit?: string) {
    return this.workoutsService.getTopRated(limit ? parseInt(limit) : 20);
  }

  @Post(':id/favorite')
  @UseGuards(ClerkAuthGuard)
  async addFavorite(@Request() req: any, @Param('id') workoutId: string) {
    return this.workoutsService.addFavorite(req.user.id, workoutId);
  }

  @Delete(':id/favorite')
  @UseGuards(ClerkAuthGuard)
  async removeFavorite(@Request() req: any, @Param('id') workoutId: string) {
    return this.workoutsService.removeFavorite(req.user.id, workoutId);
  }

  @Get('favorites')
  @UseGuards(ClerkAuthGuard)
  async getFavorites(@Request() req: any) {
    return this.workoutsService.getFavorites(req.user.id);
  }

  @Post(':id/copy')
  @UseGuards(ClerkAuthGuard)
  async copyWorkout(@Request() req: any, @Param('id') workoutId: string) {
    return this.workoutsService.copyWorkout(req.user.id, workoutId, req.user.email);
  }

  @Get(':id/share-qr')
  @UseGuards(ClerkAuthGuard)
  async getShareQR(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.getShareQR(req.user.id, id);
  }
}

