import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './admin.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}

