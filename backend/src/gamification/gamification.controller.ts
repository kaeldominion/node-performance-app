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

  @Get('achievements')
  async getAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Post('achievements/check')
  async checkAchievements(@Request() req) {
    return this.achievementsService.checkAchievements(req.user.id);
  }
}

