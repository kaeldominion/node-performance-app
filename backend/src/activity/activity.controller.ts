import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { DemoActivityService } from './demo-activity.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';

@Controller('activity')
export class ActivityController {
  constructor(
    private activityService: ActivityService,
    private demoActivityService: DemoActivityService,
  ) {}

  @Get('feed')
  @UseGuards(ClerkAuthGuard)
  async getActivityFeed(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('since') since?: string,
  ) {
    return this.activityService.getActivityFeed({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type: type as any,
      since: since ? new Date(since) : undefined,
    });
  }

  @Get('feed/recent')
  @UseGuards(ClerkAuthGuard)
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.activityService.getRecentActivity(
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('stats')
  @UseGuards(ClerkAuthGuard)
  async getActivityStats(@Query('days') days?: string) {
    return this.activityService.getActivityStats(
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('user/:userId')
  @UseGuards(ClerkAuthGuard)
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getUserActivity(
      userId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('demo/generate')
  @UseGuards(ClerkAdminGuard)
  async generateDemoActivities(@Body() body?: { days?: number }) {
    return this.demoActivityService.generateDemoActivities(body?.days || 7);
  }

  @Post('demo/add-recent')
  @UseGuards(ClerkAdminGuard)
  async addRecentDemoActivities(@Body() body?: { count?: number }) {
    return this.demoActivityService.addRecentDemoActivities(body?.count || 5);
  }

  @Post('demo/cleanup')
  @UseGuards(ClerkAdminGuard)
  async cleanupOldDemoActivities(@Body() body?: { days?: number }) {
    return this.demoActivityService.cleanupOldDemoActivities(body?.days || 30);
  }
}

