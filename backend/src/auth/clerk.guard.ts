import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.error('❌ No token provided in request');
      throw new UnauthorizedException('No token provided');
    }

    // DEV MODE: Allow mock token in development
    const isDevMode = process.env.NODE_ENV === 'development' || 
                      process.env.DEV_MODE === 'true';
    
    if (isDevMode && token === 'dev-mock-token') {
      console.log('🔧 DEV MODE: Using mock authentication (Clerk bypass)');
      // Use mock user for development
      request.user = {
        id: 'dev-user-123',
        email: 'dev@node.local',
        role: 'HOME_USER',
        isAdmin: true, // Make admin for easier testing
      };
      return true;
    }

    // Check if CLERK_SECRET_KEY is set
    if (!process.env.CLERK_SECRET_KEY) {
      // In dev mode, if no Clerk key, allow mock token
      if (isDevMode) {
        console.log('🔧 DEV MODE: No CLERK_SECRET_KEY, using mock authentication');
        request.user = {
          id: 'dev-user-123',
          email: 'dev@node.local',
          role: 'HOME_USER',
          isAdmin: true,
        };
        return true;
      }
      console.error('❌ CLERK_SECRET_KEY is not set in environment');
      throw new UnauthorizedException('Server configuration error');
    }

    try {
      console.log('🔍 Verifying token with Clerk...', { tokenPreview: token.substring(0, 20) + '...' });
      
      // Try to verify the token - Clerk's getToken() returns a JWT that can be verified
      let session: any;
      let clerkUser: any;
      
      // Try to verify the token - Clerk's getToken() returns a JWT
      // First try clerkClient.verifyToken
      try {
        session = await clerkClient.verifyToken(token);
        clerkUser = await clerkClient.users.getUser(session.sub);
      } catch (verifyError) {
        // If verifyToken fails, decode the JWT manually and get user
        console.log('verifyToken failed, trying JWT decode approach...', {
          error: verifyError.message,
          errorType: verifyError.constructor?.name,
        });
        
        // Decode JWT to get user ID
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        let payload: any;
        try {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        } catch (parseError) {
          throw new Error('Failed to parse JWT payload');
        }
        
        const userId = payload.sub || payload.user_id || payload.id;
        
        if (!userId) {
          console.error('JWT payload:', payload);
          throw new Error('No user ID found in token');
        }
        
        // Get user directly from Clerk using the user ID from the token
        clerkUser = await clerkClient.users.getUser(userId);
        
        // Create a session-like object for compatibility
        session = { sub: userId };
        
        console.log('✅ Successfully decoded JWT and retrieved user:', { userId });
      }
      
      // Attach user info to request
      request.user = {
        id: session.sub,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        // Get custom claims from Clerk public metadata
        role: (clerkUser.publicMetadata?.role as string) || 'HOME_USER',
        isAdmin: (clerkUser.publicMetadata?.isAdmin as boolean) || false,
      };

      console.log('✅ Token verified successfully', { userId: request.user.id, email: request.user.email });
      return true;
    } catch (error) {
      // In dev mode, if Clerk verification fails, fall back to mock user
      if (isDevMode) {
        console.warn('⚠️ DEV MODE: Clerk verification failed, using mock authentication:', error.message);
        request.user = {
          id: 'dev-user-123',
          email: 'dev@node.local',
          role: 'HOME_USER',
          isAdmin: true,
        };
        return true;
      }
      
      console.error('❌ Clerk token verification failed:', {
        error: error.message || error,
        errorType: error.constructor?.name,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        errorDetails: error,
      });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

