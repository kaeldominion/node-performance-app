import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @UseGuards(ClerkAuthGuard)
  async getStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getUserStats(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('strength')
  @UseGuards(ClerkAuthGuard)
  async getStrengthProgress(
    @Request() req,
    @Query('exercise') exercise?: string,
  ) {
    return this.analyticsService.getStrengthProgress(req.user.id, exercise);
  }

  @Get('engine')
  @UseGuards(ClerkAuthGuard)
  async getEngineProgress(@Request() req) {
    return this.analyticsService.getEngineProgress(req.user.id);
  }

  @Get('weekly')
  @UseGuards(ClerkAuthGuard)
  async getWeeklySummary(
    @Request() req,
    @Query('weekStart') weekStart?: string,
  ) {
    return this.analyticsService.getWeeklySummary(
      req.user.id,
      weekStart ? new Date(weekStart) : undefined,
    );
  }

  @Get('monthly')
  @UseGuards(ClerkAuthGuard)
  async getMonthlySummary(
    @Request() req,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.analyticsService.getMonthlySummary(
      req.user.id,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('trends')
  @UseGuards(ClerkAuthGuard)
  async getTrends(
    @Request() req,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTrends(req.user.id, days ? parseInt(days) : 30);
  }

  // Coach endpoints to view client analytics
  @Get('clients/:clientId/stats')
  @UseGuards(ClerkAuthGuard)
  async getClientStats(
    @Request() req,
    @Param('clientId') clientId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getUserStats(
      clientId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('clients/:clientId/trends')
  @UseGuards(ClerkAuthGuard)
  async getClientTrends(
    @Request() req,
    @Param('clientId') clientId: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTrends(clientId, days ? parseInt(days) : 30);
  }

  // Leaderboard endpoints (public, no auth required)
  @Get('leaderboard')
  async getLeaderboard(
    @Query('metric') metric?: 'sessions' | 'hours' | 'rpe' | 'streak',
    @Query('limit') limit?: string,
  ) {
    // Public endpoint - no auth required
    return this.analyticsService.getLeaderboard(
      metric || 'sessions',
      limit ? parseInt(limit) : 50,
    );
  }

  // Admin-only system stats
  @Get('admin/system')
  @UseGuards(ClerkAdminGuard)
  async getSystemStats(@Request() req: any) {
    console.log('getSystemStats endpoint called');
    console.log('User:', req.user);
    const stats = await this.analyticsService.getSystemStats();
    console.log('System stats:', {
      totalUsers: stats.users.total,
      totalWorkouts: stats.workouts.total,
    });
    return stats;
  }

  // Get user percentiles compared to network
  @Get('percentiles')
  @UseGuards(ClerkAuthGuard)
  async getPercentiles(@Request() req) {
    return this.analyticsService.getUserPercentiles(req.user.id);
  }

  // Get user month-over-month trends (current month vs last month)
  @Get('month-trends')
  @UseGuards(ClerkAuthGuard)
  async getMonthTrends(@Request() req) {
    return this.analyticsService.getUserTrends(req.user.id);
  }

  // Get user rank in leaderboard for all metrics
  @Get('my-rank')
  @UseGuards(ClerkAuthGuard)
  async getMyRank(@Request() req) {
    return this.analyticsService.getUserRank(req.user.id);
  }

  // Get trend comparison for different time periods
  @Get('trend-comparison')
  @UseGuards(ClerkAuthGuard)
  async getTrendComparison(
    @Request() req,
    @Query('period') period: '1m' | '3m' | '6m' | '1y',
  ) {
    return this.analyticsService.getTrendComparison(req.user.id, period || '1m');
  }
}
