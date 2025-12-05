import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AchievementsService } from './achievements.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('gamification')
@UseGuards(ClerkAuthGuard)
export class GamificationController {
  constructor(
    private gamificationService: GamificationService,
    private achievementsService: AchievementsService,
  ) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.gamificationService.getUserStats(req.user.id);
  }

  @Get('achievements/all')
  async getAllAchievements(@Request() req) {
    try {
      console.log(`📋 GET /gamification/achievements/all - User: ${req.user?.id}`);
      
      // Initialize achievements if they don't exist
      const existingCount = await this.achievementsService.getAchievementCount();
      console.log(`📊 Current achievement count in DB: ${existingCount}`);
      
      if (existingCount === 0) {
        console.log('🔄 No achievements found, initializing...');
        await this.achievementsService.initializeAchievements();
        console.log('✅ Achievements initialized');
      }
      
      const achievements = await this.achievementsService.getAllAchievementsWithStatus(req.user.id);
      console.log(`✅ Returning ${achievements.length} achievements for user ${req.user.id}`);
      console.log(`📦 Sample achievement:`, achievements[0] ? {
        id: achievements[0].id,
        code: achievements[0].code,
        name: achievements[0].name,
        earned: achievements[0].earned,
        progress: achievements[0].progress,
      } : 'No achievements');
      
      return achievements;
    } catch (error: any) {
      console.error('❌ Error in getAllAchievements:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
      });
      throw error;
    }
  }

  @Get('achievements')
  async getAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Post('achievements/check')
  async checkAchievements(@Request() req) {
    return this.achievementsService.checkAchievements(req.user.id);
  }
}

