import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InPersonSessionsService {
  constructor(private prisma: PrismaService) {}

  private generateQRCodeId(): string {
    return randomBytes(16).toString('hex');
  }

  async scheduleSession(
    coachId: string,
    clientId: string,
    scheduledAt: Date,
    workoutId?: string,
    location?: string,
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

    // Verify workout if provided
    if (workoutId) {
      const workout = await this.prisma.workout.findUnique({
        where: { id: workoutId },
      });
      if (!workout) {
        throw new NotFoundException('Workout not found');
      }
    }

    return this.prisma.inPersonSession.create({
      data: {
        coachId,
        clientId,
        coachClientId: relationship.id,
        scheduledAt: new Date(scheduledAt),
        workoutId,
        location,
        status: 'SCHEDULED',
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

  async generateQRCode(sessionId: string, coachId: string) {
    const session = await this.prisma.inPersonSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.coachId !== coachId) {
      throw new ForbiddenException('Not authorized to generate QR code for this session');
    }

    const qrCodeId = this.generateQRCodeId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    return this.prisma.inPersonSession.update({
      where: { id: sessionId },
      data: {
        qrCodeId,
        qrCodeExpires: expiresAt,
        checkInMethod: 'QR_CODE',
      },
      select: {
        id: true,
        qrCodeId: true,
        qrCodeExpires: true,
      },
    });
  }

  async checkInWithQR(qrCodeId: string, clientId: string) {
    const session = await this.prisma.inPersonSession.findFirst({
      where: {
        qrCodeId,
        clientId,
        status: 'SCHEDULED',
        qrCodeExpires: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Invalid or expired QR code');
    }

    return this.prisma.inPersonSession.update({
      where: { id: session.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        workout: true,
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async startSession(sessionId: string, coachId: string) {
    const session = await this.prisma.inPersonSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.coachId !== coachId) {
      throw new ForbiddenException('Not authorized to start this session');
    }

    return this.prisma.inPersonSession.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        checkInMethod: 'MANUAL',
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

  async completeSession(
    sessionId: string,
    coachId: string,
    notes?: string,
    clientFeedback?: string,
  ) {
    const session = await this.prisma.inPersonSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.coachId !== coachId) {
      throw new ForbiddenException('Not authorized to complete this session');
    }

    const completedAt = new Date();
    const durationSec = session.startedAt
      ? Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000)
      : null;

    return this.prisma.inPersonSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt,
        durationSec,
        notes,
        clientFeedback,
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

  async getUpcomingSessions(coachId: string) {
    const now = new Date();
    return this.prisma.inPersonSession.findMany({
      where: {
        coachId,
        scheduledAt: {
          gte: now,
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
      include: {
        workout: true,
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async getClientSessions(coachId: string, clientId: string) {
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

    return this.prisma.inPersonSession.findMany({
      where: {
        coachClientId: relationship.id,
      },
      include: {
        workout: true,
        sessionLog: true,
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }
}
