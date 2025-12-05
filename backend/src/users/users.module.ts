import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, MeController, AdminUsersController, SetupController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), ActivityModule],
  controllers: [UsersController, MeController, AdminUsersController, SetupController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

