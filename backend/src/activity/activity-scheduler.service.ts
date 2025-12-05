import { Injectable, OnModuleInit } from '@nestjs/common';
import { DemoActivityService } from './demo-activity.service';

@Injectable()
export class ActivitySchedulerService implements OnModuleInit {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private demoActivityService: DemoActivityService) {}

  onModuleInit() {
    // Start scheduled task to add demo activities every 30 minutes
    this.startScheduler();
  }

  private startScheduler() {
    // Add demo activities every 30 minutes to keep feed active
    this.intervalId = setInterval(async () => {
      try {
        await this.demoActivityService.addRecentDemoActivities(3); // Add 3 new activities
        console.log('✅ Added recent demo activities');
      } catch (error) {
        console.error('❌ Failed to add demo activities:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Also add some initial activities on startup
    setTimeout(async () => {
      try {
        await this.demoActivityService.addRecentDemoActivities(5);
        console.log('✅ Added initial demo activities on startup');
      } catch (error) {
        console.error('❌ Failed to add initial demo activities:', error);
      }
    }, 5000); // Wait 5 seconds after startup
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

