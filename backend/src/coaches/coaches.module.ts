import { Module } from '@nestjs/common';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';
import { InPersonSessionsService } from './in-person-sessions.service';
import { CoachesSchedulerService } from './coaches-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, AuthModule, EmailModule],
  controllers: [CoachesController],
  providers: [CoachesService, InPersonSessionsService, CoachesSchedulerService],
  exports: [CoachesService, InPersonSessionsService],
})
export class CoachesModule {}
