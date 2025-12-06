import { Module, forwardRef } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AchievementsService } from './achievements.service';
import { GamificationController } from './gamification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, forwardRef(() => UsersModule)],
  providers: [GamificationService, AchievementsService],
  controllers: [GamificationController],
  exports: [GamificationService, AchievementsService],
})
export class GamificationModule {}

