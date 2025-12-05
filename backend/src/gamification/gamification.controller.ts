import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Controller('gamification')
@UseGuards(ClerkAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.gamificationService.getUserStats(req.user.id);
  }
}

