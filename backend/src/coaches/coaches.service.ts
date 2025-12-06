import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateCoachProfileDto } from './dto/create-coach-profile.dto';
import { CreateCoachClientDto } from './dto/create-coach-client.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CoachesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // Generate unique invite code
  private generateInviteCode(): string {
    return randomBytes(8).toString('hex').toUpperCase();
  }

  // Coach Upgrade
  async upgradeToCoach(userId: string, createDto: CreateCoachProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a coach
    if (user.role === 'COACH') {
      throw new ForbiddenException('User is already a coach');
    }

    // Generate unique invite code
    let inviteCode = this.generateInviteCode();
    let codeExists = await this.prisma.coachProfile.findUnique({
      where: { inviteCode },
    });
    while (codeExists) {
      inviteCode = this.generateInviteCode();
      codeExists = await this.prisma.coachProfile.findUnique({
        where: { inviteCode },
      });
    }

    // Update user role and create coach profile in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: 'COACH' },
      });

      // Create coach profile
      return tx.coachProfile.create({
        data: {
          userId,
          ...createDto,
          inviteCode,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  }

  // Coach Profile Management
  async createProfile(userId: string, createDto: CreateCoachProfileDto) {
    // Check if user has COACH role
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'COACH') {
      throw new ForbiddenException('User must have COACH role');
    }

    return this.prisma.coachProfile.upsert({
      where: { userId },
      update: createDto,
      create: {
        userId,
        ...createDto,
        inviteCode: this.generateInviteCode(),
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        clients: {
          include: {
            client: {
              select: {
                id: true,
                email: true,
                name: true,
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        clients: {
          include: {
            client: {
              select: {
                id: true,
                email: true,
                name: true,
                profile: true,
              },
            },
            assignments: {
              include: {
                program: true,
              },
            },
          },
        },
        programs: {
          include: {
            workouts: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }

    return profile;
  }

  // Client Management
  async addClient(coachId: string, createDto: CreateCoachClientDto) {
    // Verify coach exists
    const coach = await this.prisma.user.findUnique({
      where: { id: coachId },
    });
    if (!coach || coach.role !== 'COACH') {
      throw new ForbiddenException('User is not a coach');
    }

    // Check if client exists
    const client = await this.prisma.user.findUnique({
      where: { id: createDto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.coachClient.upsert({
      where: {
        coachId_clientId: {
          coachId,
          clientId: createDto.clientId,
        },
      },
      update: {
        status: createDto.status || 'ACTIVE',
        notes: createDto.notes,
      },
      create: {
        coachId,
        clientId: createDto.clientId,
        status: createDto.status || 'ACTIVE',
        notes: createDto.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
        assignments: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  async getClients(coachId: string) {
    return this.prisma.coachClient.findMany({
      where: { coachId },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
        assignments: {
          include: {
            program: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async removeClient(coachId: string, clientId: string) {
    const client = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client relationship not found');
    }

    return this.prisma.coachClient.delete({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });
  }

  // Program Assignment
  async assignProgram(coachId: string, clientId: string, programId: string, startDate?: Date) {
    // Verify coach-client relationship
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new ForbiddenException('Coach-client relationship not found');
    }

    return this.prisma.programAssignment.upsert({
      where: {
        coachClientId_programId: {
          coachClientId: relationship.id,
          programId,
        },
      },
      update: {
        status: 'ACTIVE',
        startDate: startDate || new Date(),
      },
      create: {
        coachClientId: relationship.id,
        programId,
        startDate: startDate || new Date(),
        status: 'ACTIVE',
      },
      include: {
        program: {
          include: {
            workouts: true,
          },
        },
      },
    });
  }

  async getClientAssignments(coachId: string, clientId: string) {
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    return this.prisma.programAssignment.findMany({
      where: { coachClientId: relationship.id },
      include: {
        program: {
          include: {
            workouts: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  // Workout Assignment
  async assignWorkout(
    coachId: string,
    clientId: string,
    workoutId: string,
    scheduledFor?: Date,
    dueDate?: Date,
    notes?: string,
  ) {
    // Verify coach-client relationship
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new ForbiddenException('Coach-client relationship not found');
    }

    // Verify workout exists
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    // Create assignment
    return this.prisma.coachWorkoutAssignment.create({
      data: {
        coachId,
        clientId,
        workoutId,
        coachClientId: relationship.id,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: 'PENDING',
      },
      include: {
        workout: true,
        client: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getClientWorkouts(coachId: string, clientId: string) {
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    return this.prisma.coachWorkoutAssignment.findMany({
      where: {
        coachClientId: relationship.id,
      },
      include: {
        workout: true,
        sessionLog: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getClientUpcomingWorkouts(coachId: string, clientId: string) {
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    const now = new Date();
    return this.prisma.coachWorkoutAssignment.findMany({
      where: {
        coachClientId: relationship.id,
        status: 'PENDING',
        OR: [
          { scheduledFor: { gte: now } },
          { scheduledFor: null },
        ],
      },
      include: {
        workout: true,
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { assignedAt: 'desc' },
      ],
    });
  }

  async updateWorkoutAssignmentStatus(
    assignmentId: string,
    coachId: string,
    status: string,
    clientNotes?: string,
  ) {
    const assignment = await this.prisma.coachWorkoutAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Workout assignment not found');
    }

    if (assignment.coachId !== coachId) {
      throw new ForbiddenException('Not authorized to update this assignment');
    }

    const updateData: any = {
      status,
    };

    if (status === 'COMPLETED' && !assignment.completedAt) {
      updateData.completedAt = new Date();
    }

    if (clientNotes !== undefined) {
      updateData.clientNotes = clientNotes;
    }

    return this.prisma.coachWorkoutAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        workout: true,
        sessionLog: true,
      },
    });
  }

  // Client Discovery & Invitation
  async searchClients(query: string, filters?: { limit?: number }) {
    const limit = filters?.limit || 20;
    
    // Search users by email, name, or username (public profiles only)
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
        role: {
          not: 'COACH', // Don't show coaches in client search
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        profile: {
          select: {
            imageUrl: true,
            bio: true,
            location: true,
          },
        },
      },
      take: limit,
    });

    return users;
  }

  async sendInvitation(coachId: string, clientId: string, message?: string) {
    // Verify coach exists
    const coach = await this.prisma.user.findUnique({
      where: { id: coachId },
      include: { coachProfile: true },
    });
    if (!coach || coach.role !== 'COACH') {
      throw new ForbiddenException('User is not a coach');
    }

    // Check if client exists
    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if relationship already exists
    const existing = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('Client relationship already exists');
    }

    // Create pending relationship
    return this.prisma.coachClient.create({
      data: {
        coachId,
        clientId,
        status: 'PENDING',
        invitedAt: new Date(),
        notes: message,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
      },
    });
  }

  async acceptInvitation(clientId: string, coachId: string, inviteCode?: string) {
    // If invite code provided, verify it matches coach's code
    if (inviteCode) {
      const coach = await this.prisma.coachProfile.findUnique({
        where: { inviteCode },
      });
      if (!coach || coach.userId !== coachId) {
        throw new ForbiddenException('Invalid invite code');
      }
    }

    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Invitation not found');
    }

    if (relationship.status !== 'PENDING') {
      throw new ForbiddenException('Invitation is not pending');
    }

    return this.prisma.coachClient.update({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
      data: {
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            coachProfile: true,
          },
        },
      },
    });
  }

  async declineInvitation(clientId: string, coachId: string) {
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Invitation not found');
    }

    // Delete the pending invitation
    return this.prisma.coachClient.delete({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });
  }

  async getPendingInvitations(clientId: string) {
    return this.prisma.coachClient.findMany({
      where: {
        clientId,
        status: 'PENDING',
      },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            coachProfile: {
              select: {
                bio: true,
                specialties: true,
                certifications: true,
              },
            },
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });
  }

  // Client Progress Analytics
  async getClientProgress(coachId: string, clientId: string, timeframe?: { startDate?: Date; endDate?: Date }) {
    // Verify coach-client relationship
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    const startDate = timeframe?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const endDate = timeframe?.endDate || new Date();

    // Get sessions in timeframe
    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        userId: clientId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
        completed: true,
      },
      include: {
        workout: true,
      },
    });

    // Calculate metrics
    const totalSessions = sessions.length;
    const totalDurationSec = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
    const avgRPE = sessions
      .filter((s) => s.rpe)
      .reduce((sum, s, _, arr) => sum + (s.rpe || 0) / arr.length, 0);

    // Get assigned workouts completion
    const assignments = await this.prisma.coachWorkoutAssignment.findMany({
      where: {
        coachClientId: relationship.id,
        assignedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED').length;
    const completionRate = assignments.length > 0
      ? (completedAssignments / assignments.length) * 100
      : 0;

    return {
      timeframe: {
        startDate,
        endDate,
      },
      sessions: {
        total: totalSessions,
        totalDurationSec,
        avgDurationSec: totalSessions > 0 ? totalDurationSec / totalSessions : 0,
        avgRPE: avgRPE || 0,
      },
      assignments: {
        total: assignments.length,
        completed: completedAssignments,
        completionRate,
      },
    };
  }

  async getClientStats(coachId: string, clientId: string) {
    // Verify coach-client relationship
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    // Get all sessions
    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        userId: clientId,
        completed: true,
      },
    });

    // Get all assignments
    const assignments = await this.prisma.coachWorkoutAssignment.findMany({
      where: {
        coachClientId: relationship.id,
      },
    });

    // Get in-person sessions
    const inPersonSessions = await this.prisma.inPersonSession.findMany({
      where: {
        coachClientId: relationship.id,
      },
    });

    return {
      sessions: {
        total: sessions.length,
        totalDurationSec: sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0),
      },
      assignments: {
        total: assignments.length,
        completed: assignments.filter((a) => a.status === 'COMPLETED').length,
        pending: assignments.filter((a) => a.status === 'PENDING').length,
      },
      inPersonSessions: {
        total: inPersonSessions.length,
        completed: inPersonSessions.filter((s) => s.status === 'COMPLETED').length,
      },
      relationship: {
        startDate: relationship.startDate,
        status: relationship.status,
      },
    };
  }

  async getClientWorkoutHistory(coachId: string, clientId: string) {
    // Verify coach-client relationship
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    // Get completed assignments with session logs
    const assignments = await this.prisma.coachWorkoutAssignment.findMany({
      where: {
        coachClientId: relationship.id,
        status: 'COMPLETED',
      },
      include: {
        workout: true,
        sessionLog: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return assignments;
  }

  async getClientTrends(coachId: string, clientId: string, metric: string) {
    // Verify coach-client relationship
    const relationship = await this.prisma.coachClient.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId,
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    const days = 30; // Default to 30 days
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        userId: clientId,
        startedAt: {
          gte: startDate,
        },
        completed: true,
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // Group by date
    const dailyStats: Record<string, any> = {};
    sessions.forEach((session) => {
      const dateKey = session.startedAt.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          sessions: 0,
          duration: 0,
          rpe: [],
        };
      }
      dailyStats[dateKey].sessions += 1;
      dailyStats[dateKey].duration += session.durationSec || 0;
      if (session.rpe) {
        dailyStats[dateKey].rpe.push(session.rpe);
      }
    });

    // Calculate averages
    const trends = Object.values(dailyStats).map((day: any) => ({
      date: day.date,
      sessions: day.sessions,
      duration: day.duration,
      avgRPE: day.rpe.length > 0
        ? day.rpe.reduce((sum: number, r: number) => sum + r, 0) / day.rpe.length
        : null,
    }));

    return {
      metric,
      timeframe: {
        startDate,
        endDate: new Date(),
        days,
      },
      trends,
    };
  }
}
