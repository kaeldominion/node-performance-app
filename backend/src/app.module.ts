import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProgramsModule,
    WorkoutsModule,
    SessionsModule,
    AiModule,
  ],
})
export class AppModule {}

