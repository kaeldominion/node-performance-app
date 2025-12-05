import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async createFromClerk(data: { id: string; email: string; role?: string; isAdmin?: boolean; name?: string }) {
    const isNewUser = !(await this.prisma.user.findUnique({ where: { id: data.id } }));
    
    const user = await this.prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        name: data.name,
        role: (data.role as any) || 'HOME_USER',
        isAdmin: data.isAdmin || false,
      },
      create: {
        id: data.id,
        email: data.email,
        name: data.name,
        passwordHash: '', // Clerk handles passwords
        role: (data.role as any) || 'HOME_USER',
        isAdmin: data.isAdmin || false,
      },
    });

    // Log activity for new user registration
    if (isNewUser) {
      const userName = user.username ? `@${user.username}` : user.name || 'Someone';
      await this.activityService.createActivity(
        user.id,
        'USER_REGISTERED',
        `New user ${userName} joined`,
        {
          entityType: 'user',
          entityId: user.id,
        },
      ).catch(() => {});
    }

    return user;
  }

  async findByEmail(email: string) {
    // This is used internally for auth, so we need passwordHash
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    
    if (!user) return null;
    
    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as typeof userWithoutPassword & { isAdmin: boolean };
  }

  async updateProfile(userId: string, updateDto: UpdateUserProfileDto) {
    // Extract username if present (it's on User, not UserProfile)
    const { username, ...profileData } = updateDto as any;
    
    // Update username on User model if provided
    // If username is explicitly provided (even if empty string), update it
    if (username !== undefined) {
      const usernameValue = username && username.trim() ? username.trim() : null;
      await this.prisma.user.update({
        where: { id: userId },
        data: { username: usernameValue }, // Set to null if empty string
      });
    }
    
    // Update or create profile
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    
    // Remove passwordHash from all users
    return users.map(({ passwordHash, ...user }) => user);
  }

  async getPublicProfile(userId: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            sessions: true,
            programs: true,
            networkAsRequester: true,
            networkAsAddressee: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get network connection status (only if currentUserId provided)
    let networkConnection = null;
    if (currentUserId) {
      networkConnection = await this.prisma.network.findFirst({
        where: {
          OR: [
            { requesterId: currentUserId, addresseeId: userId },
            { requesterId: userId, addresseeId: currentUserId },
          ],
        },
      });
    }

    // Get recent sessions
    const recentSessions = await this.prisma.sessionLog.findMany({
      where: { userId, completed: true },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            displayCode: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    // Get stats
    const totalSessions = user._count.sessions;
    const totalPrograms = user._count.programs;
    const networkCount = user._count.networkAsRequester + user._count.networkAsAddressee;

    // Calculate additional stats from completed sessions
    const completedSessions = await this.prisma.sessionLog.findMany({
      where: { userId, completed: true },
      select: {
        durationSec: true,
        rpe: true,
        startedAt: true,
      },
    });

    const totalHours = completedSessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 3600;
    const avgRPE = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / completedSessions.length
      : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasSession = completedSessions.some((s) => {
        const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });
      
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate sessions per week (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessionsCount = completedSessions.filter(s => s.startedAt >= thirtyDaysAgo).length;
    const daysDiff = Math.max(1, Math.floor((Date.now() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)));
    const sessionsPerWeek = (recentSessionsCount / daysDiff) * 7;

    // Remove passwordHash and sensitive data
    const { passwordHash, ...publicUser } = user;

    return {
      ...publicUser,
      stats: {
        totalSessions,
        totalPrograms,
        networkCount,
        level: user.level,
        xp: user.xp,
        totalHours: Math.round(totalHours * 10) / 10,
        avgRPE: Math.round(avgRPE * 10) / 10,
        streak,
        sessionsPerWeek: Math.round(sessionsPerWeek * 10) / 10,
      },
      networkStatus: networkConnection && currentUserId
        ? {
            id: networkConnection.id,
            status: networkConnection.status,
            isRequester: networkConnection.requesterId === currentUserId,
          }
        : null,
      recentSessions,
    };
  }

  async setAdmin(userId: string, isAdmin: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateRole(userId: string, role: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateSubscription(userId: string, tier: string, subscriptionEnds?: Date) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier as any,
        subscriptionEnds,
      },
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

