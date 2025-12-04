import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the token with Clerk
      const session = await clerkClient.verifyToken(token);
      
      // Get user from Clerk to access metadata
      const clerkUser = await clerkClient.users.getUser(session.sub);
      
      // Attach user info to request
      request.user = {
        id: session.sub,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        // Get custom claims from Clerk public metadata
        role: (clerkUser.publicMetadata?.role as string) || 'HOME_USER',
        isAdmin: (clerkUser.publicMetadata?.isAdmin as boolean) || false,
      };

      return true;
    } catch (error) {
      console.error('Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

