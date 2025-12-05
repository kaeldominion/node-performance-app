import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { DemoActivityService } from './demo-activity.service';
import { ActivitySchedulerService } from './activity-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ActivityService, DemoActivityService, ActivitySchedulerService],
  controllers: [ActivityController],
  exports: [ActivityService, DemoActivityService],
})
export class ActivityModule {}

