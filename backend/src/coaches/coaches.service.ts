import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoachProfileDto } from './dto/create-coach-profile.dto';
import { CreateCoachClientDto } from './dto/create-coach-client.dto';

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaService) {}

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
}
