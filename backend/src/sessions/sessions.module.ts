import { Module, forwardRef } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { UserProgramsService } from './user-programs.service';
import { UserProgramsController } from './user-programs.controller';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [forwardRef(() => GamificationModule)],
  controllers: [SessionsController, UserProgramsController],
  providers: [SessionsService, UserProgramsService],
})
export class SessionsModule {}

