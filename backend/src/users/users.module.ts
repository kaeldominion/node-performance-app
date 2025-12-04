import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, AdminUsersController, SetupController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController, AdminUsersController, SetupController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

