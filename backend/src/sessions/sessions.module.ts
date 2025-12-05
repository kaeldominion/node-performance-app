import { Module, forwardRef } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { UserProgramsService } from './user-programs.service';
import { UserProgramsController } from './user-programs.controller';
import { GamificationModule } from '../gamification/gamification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => GamificationModule),
    ActivityModule,
    NotificationsModule,
  ],
  controllers: [SessionsController, UserProgramsController],
  providers: [SessionsService, UserProgramsService],
  exports: [SessionsService],
})
export class SessionsModule {}

