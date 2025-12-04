import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ClerkAuthGuard } from './clerk.guard';

@Injectable()
export class ClerkAdminGuard extends ClerkAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if user is authenticated
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is admin
    if (!user.isAdmin && user.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

