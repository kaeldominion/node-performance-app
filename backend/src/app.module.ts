import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CoachesModule } from './coaches/coaches.module';
import { GymsModule } from './gyms/gyms.module';
import { TemplatesModule } from './templates/templates.module';
import { GamificationModule } from './gamification/gamification.module';
import { ScheduleModule } from './schedule/schedule.module';
import { NetworkModule } from './network/network.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProgramsModule,
    WorkoutsModule,
    SessionsModule,
    AiModule,
    ExercisesModule,
    CoachesModule,
    GymsModule,
    TemplatesModule,
    AnalyticsModule,
    GamificationModule,
    ScheduleModule,
    NetworkModule,
    NotificationsModule,
    ActivityModule,
  ],
})
export class AppModule {}

