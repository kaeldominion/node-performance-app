import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class NetworkService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
  ) {}

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();

    // Search by email, name, or username
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, // Exclude current user
          {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { username: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        xp: true,
        level: true,
        networkCode: true,
      },
      take: 10,
    });

    return users;
  }

  async searchByUsername(username: string, currentUserId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
        id: { not: currentUserId },
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        xp: true,
        level: true,
        networkCode: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found with this username');
    }

    return user;
  }

  async searchByNetworkCode(networkCode: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { networkCode },
      select: {
        id: true,
        email: true,
        name: true,
        xp: true,
        level: true,
        networkCode: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found with this network code');
    }

    if (user.id === currentUserId) {
      throw new BadRequestException('Cannot add yourself to your network');
    }

    return user;
  }

  async sendNetworkRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot add yourself to your network');
    }

    // Check if network connection already exists
    const existing = await this.prisma.network.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Already connected in network');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestException('Network request already pending');
      }
      if (existing.status === 'BLOCKED') {
        throw new BadRequestException('Cannot send network request');
      }
    }

    // Create or update network request
    const networkRequest = await this.prisma.network.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId,
          addresseeId,
        },
      },
      create: {
        requesterId,
        addresseeId,
        status: 'PENDING',
      },
      update: {
        status: 'PENDING',
      },
    });

    // Create notification for the addressee
    await this.notificationsService.createNotification(
      addresseeId,
      'NETWORK_REQUEST',
      networkRequest.id,
    ).catch(() => {
      // Don't fail if notification creation fails
    });

    // Log activity
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { name: true, username: true },
    });
    const requesterName = requester?.username ? `@${requester.username}` : requester?.name || 'Someone';
    
    await this.activityService.createActivity(
      requesterId,
      'NETWORK_CONNECTED',
      `${requesterName} sent a network request`,
      { entityType: 'network', entityId: networkRequest.id },
    ).catch(() => {});

    return networkRequest;
  }

  async acceptNetworkRequest(userId: string, networkRequestId: string) {
    const networkRequest = await this.prisma.network.findUnique({
      where: { id: networkRequestId },
    });

    if (!networkRequest) {
      throw new NotFoundException('Network request not found');
    }

    if (networkRequest.addresseeId !== userId) {
      throw new BadRequestException('You can only accept network requests sent to you');
    }

    const updated = await this.prisma.network.update({
      where: { id: networkRequestId },
      data: { status: 'ACCEPTED' },
    });

    // Create notification for the requester
    await this.notificationsService.createNotification(
      networkRequest.requesterId,
      'NETWORK_ACCEPTED',
      networkRequest.id,
    ).catch(() => {
      // Don't fail if notification creation fails
    });

    // Log activity
    const addressee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true },
    });
    const requester = await this.prisma.user.findUnique({
      where: { id: networkRequest.requesterId },
      select: { name: true, username: true },
    });
    const addresseeName = addressee?.username ? `@${addressee.username}` : addressee?.name || 'Someone';
    const requesterName = requester?.username ? `@${requester.username}` : requester?.name || 'Someone';
    
    await this.activityService.createActivity(
      userId,
      'NETWORK_CONNECTED',
      `${addresseeName} connected with ${requesterName}`,
      { entityType: 'network', entityId: networkRequest.id },
    ).catch(() => {});

    return updated;
  }

  async rejectNetworkRequest(userId: string, networkRequestId: string) {
    const networkRequest = await this.prisma.network.findUnique({
      where: { id: networkRequestId },
    });

    if (!networkRequest) {
      throw new NotFoundException('Network request not found');
    }

    if (networkRequest.addresseeId !== userId) {
      throw new BadRequestException('You can only reject network requests sent to you');
    }

    // Delete the network request (rejection means removing it)
    await this.prisma.network.delete({
      where: { id: networkRequestId },
    });

    // Create notification for the requester
    await this.notificationsService.createNotification(
      networkRequest.requesterId,
      'NETWORK_REJECTED',
      networkRequest.id,
    ).catch(() => {
      // Don't fail if notification creation fails
    });

    return { success: true };
  }

  async removeNetwork(userId: string, networkUserId: string) {
    const networkConnection = await this.prisma.network.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: networkUserId },
          { requesterId: networkUserId, addresseeId: userId },
        ],
      },
    });

    if (!networkConnection) {
      throw new NotFoundException('Network connection not found');
    }

    return this.prisma.network.delete({
      where: { id: networkConnection.id },
    });
  }

  async getNetwork(userId: string) {
    const networkConnections = await this.prisma.network.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
            xp: true,
            level: true,
            networkCode: true,
          },
        },
        addressee: {
          select: {
            id: true,
            email: true,
            name: true,
            xp: true,
            level: true,
            networkCode: true,
          },
        },
      },
    });

    // Return the network connection (not the current user)
    return networkConnections.map((f) => {
      const networkUser = f.requesterId === userId ? f.addressee : f.requester;
      return {
        ...networkUser,
        networkId: f.id,
        addedAt: f.createdAt,
      };
    });
  }

  async getNetworkActivity(userId: string) {
    const network = await this.getNetwork(userId);
    const networkUserIds = network.map((f) => f.id);

    if (networkUserIds.length === 0) {
      return [];
    }

    // Get recent sessions from network
    const recentSessions = await this.prisma.sessionLog.findMany({
      where: {
        userId: { in: networkUserIds },
        completed: true,
      },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            displayCode: true,
            archetype: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 50, // Get last 50 sessions from all network connections
    });

    // Get network stats
    const networkStats = await this.prisma.user.findMany({
      where: { id: { in: networkUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        _count: {
          select: {
            sessions: {
              where: { completed: true },
            },
          },
        },
      },
    });

    // Get network sessions count for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentNetworkSessions = await this.prisma.sessionLog.groupBy({
      by: ['userId'],
      where: {
        userId: { in: networkUserIds },
        completed: true,
        startedAt: { gte: sevenDaysAgo },
      },
      _count: {
        id: true,
      },
    });

    const sessionsCountMap = new Map(
      recentNetworkSessions.map((s) => [s.userId, s._count.id]),
    );

    return networkStats.map((networkUser) => ({
      ...networkUser,
      totalSessions: networkUser._count.sessions,
      recentSessions: sessionsCountMap.get(networkUser.id) || 0,
      recentActivity: recentSessions
        .filter((s) => s.userId === networkUser.id)
        .slice(0, 5)
        .map((s) => ({
          workoutName: s.workout.name,
          workoutId: s.workout.id,
          performedAt: s.startedAt,
          rpe: s.rpe,
          durationSec: s.durationSec,
        })),
    }));
  }

  async getPendingRequests(userId: string) {
    const pending = await this.prisma.network.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
            xp: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pending;
  }

  async generateNetworkCode(userId: string) {
    // Generate a unique network code
    const code = `NT${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Check if code exists
    const existing = await this.prisma.user.findUnique({
      where: { networkCode: code },
    });

    if (existing) {
      // If code exists, generate a new one recursively
      return this.generateNetworkCode(userId);
    }

    // Update user with network code
    return this.prisma.user.update({
      where: { id: userId },
      data: { networkCode: code },
      select: { networkCode: true },
    });
  }

  async getUserDirectory(
    currentUserId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      minLevel?: number;
      maxLevel?: number;
    } = {},
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const where: any = {
      id: { not: currentUserId },
    };

    // Search filter
    if (options.search && options.search.trim().length > 0) {
      const searchTerm = options.search.trim();
      where.OR = [
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { username: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Level filters
    if (options.minLevel !== undefined) {
      where.level = { gte: options.minLevel };
    }
    if (options.maxLevel !== undefined) {
      where.level = { ...where.level, lte: options.maxLevel };
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        xp: true,
        level: true,
        networkCode: true,
        createdAt: true,
      },
      orderBy: { level: 'desc' },
      skip,
      take: limit,
    });

    // Get connection status for each user
    const userIds = users.map((u) => u.id);
    const connections = await this.prisma.network.findMany({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: { in: userIds } },
          { requesterId: { in: userIds }, addresseeId: currentUserId },
        ],
      },
      select: {
        requesterId: true,
        addresseeId: true,
        status: true,
      },
    });

    const connectionMap = new Map();
    connections.forEach((conn) => {
      const otherUserId =
        conn.requesterId === currentUserId
          ? conn.addresseeId
          : conn.requesterId;
      connectionMap.set(otherUserId, conn.status);
    });

    return {
      users: users.map((user) => ({
        ...user,
        connectionStatus: connectionMap.get(user.id) || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async generateShareLink(userId: string, type: 'code' | 'user' = 'code') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { networkCode: true, id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (type === 'code' && !user.networkCode) {
      // Generate code if it doesn't exist
      const codeResult = await this.generateNetworkCode(userId);
      return {
        url: `/network/connect/${codeResult.networkCode}`,
        code: codeResult.networkCode,
      };
    }

    if (type === 'code') {
      return {
        url: `/network/connect/${user.networkCode}`,
        code: user.networkCode,
      };
    }

    // For user ID type
    return {
      url: `/network/connect/${user.id}`,
      code: user.networkCode,
    };
  }
}

