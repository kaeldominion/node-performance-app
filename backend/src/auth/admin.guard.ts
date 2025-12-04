import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  constructor(private usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check JWT authentication
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // Then check if user is admin
    const request = context.switchToHttp().getRequest();
    const user = await this.usersService.findOne(request.user.id);

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

