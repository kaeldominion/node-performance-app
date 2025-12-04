import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { UserProgramsService } from './user-programs.service';
import { UserProgramsController } from './user-programs.controller';

@Module({
  controllers: [SessionsController, UserProgramsController],
  providers: [SessionsService, UserProgramsService],
})
export class SessionsModule {}

