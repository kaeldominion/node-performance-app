import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
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
  async getStrengthProgress(
    @Request() req,
    @Query('exercise') exercise?: string,
  ) {
    return this.analyticsService.getStrengthProgress(req.user.id, exercise);
  }

  @Get('engine')
  async getEngineProgress(@Request() req) {
    return this.analyticsService.getEngineProgress(req.user.id);
  }

  @Get('weekly')
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
  async getTrends(
    @Request() req,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTrends(req.user.id, days ? parseInt(days) : 30);
  }

  // Coach endpoints to view client analytics
  @Get('clients/:clientId/stats')
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
  async getClientTrends(
    @Request() req,
    @Param('clientId') clientId: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTrends(clientId, days ? parseInt(days) : 30);
  }
}
