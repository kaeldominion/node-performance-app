import { Module, forwardRef } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [
    PrismaModule,
    ActivityModule,
    NotificationsModule,
    ExercisesModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}

