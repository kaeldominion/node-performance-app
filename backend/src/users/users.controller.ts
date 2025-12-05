import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('public/:userId')
  async getPublicProfile(@Param('userId') userId: string, @Request() req: any) {
    // Optional auth - if user is logged in, pass their ID for network status
    const currentUserId = req.user?.id;
    return this.usersService.getPublicProfile(userId, currentUserId);
  }

  @Get('public/:userId/stats')
  async getPublicProfileStats(@Param('userId') userId: string) {
    // Public endpoint - no auth required
    const profile = await this.usersService.getPublicProfile(userId);
    return {
      userId: profile.id,
      name: profile.name,
      username: profile.username,
      level: profile.level,
      xp: profile.xp,
      stats: profile.stats,
    };
  }
}

@Controller('me')
@UseGuards(ClerkAuthGuard)
export class MeController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMe(@Request() req) {
    try {
      console.log('getMe endpoint called, user from request:', {
        id: req.user?.id,
        email: req.user?.email,
        role: req.user?.role,
        isAdmin: req.user?.isAdmin,
      });
      
      if (!req.user || !req.user.id) {
        console.error('No user in request');
        throw new Error('User not authenticated');
      }
      
      let user = await this.usersService.findOne(req.user.id);
      
      // If user doesn't exist, create them (handles webhook delays)
      if (!user) {
        console.log('User not found in DB, creating from Clerk data...');
        await this.usersService.createFromClerk({
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          isAdmin: req.user.isAdmin,
        });
        // Fetch again with profile included to match return type
        user = await this.usersService.findOne(req.user.id);
        console.log('User created, fetched:', { id: user?.id, email: user?.email });
      } else {
        console.log('User found in DB:', { id: user.id, email: user.email });
      }
      
      return user;
    } catch (error: any) {
      console.error('Error in getMe:', {
        message: error?.message,
        stack: error?.stack,
        user: req.user,
      });
      throw error;
    }
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateDto);
  }
}

@Controller('admin/users')
@UseGuards(ClerkAdminGuard)
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch(':id/admin')
  async setAdmin(@Param('id') id: string, @Body() body: { isAdmin: boolean }) {
    return this.usersService.setAdmin(id, body.isAdmin);
  }
}

// One-time endpoint to set initial admin - remove after use
@Controller('setup')
export class SetupController {
  constructor(private usersService: UsersService) {}

  @Post('make-admin')
  async makeAdmin(@Body() body: { email: string }) {
    // TEMPORARY: Remove this endpoint after setting admin
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      return { error: 'User not found' };
    }

    const updated = await this.usersService.setAdmin(user.id, true);
    return { success: true, message: `${body.email} is now an admin`, user: updated };
  }
}
