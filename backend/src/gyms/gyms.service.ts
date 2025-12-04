import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymProfileDto } from './dto/create-gym-profile.dto';
import { CreateGymClassDto } from './dto/create-gym-class.dto';

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  // Gym Profile Management
  async createProfile(userId: string, createDto: CreateGymProfileDto) {
    // Check if user has GYM_OWNER role
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'GYM_OWNER') {
      throw new ForbiddenException('User must have GYM_OWNER role');
    }

    return this.prisma.gymProfile.upsert({
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        classes: true,
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.gymProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profile: true,
              },
            },
          },
        },
        classes: {
          include: {
            workout: true,
            attendees: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Gym profile not found');
    }

    return profile;
  }

  // Member Management
  async addMember(gymId: string, userId: string) {
    const gym = await this.prisma.gymProfile.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      throw new NotFoundException('Gym not found');
    }

    return this.prisma.gymMember.upsert({
      where: {
        gymId_userId: {
          gymId,
          userId,
        },
      },
      update: {
        status: 'ACTIVE',
      },
      create: {
        gymId,
        userId,
        status: 'ACTIVE',
      },
      include: {
        user: {
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

  async getMembers(gymId: string) {
    return this.prisma.gymMember.findMany({
      where: { gymId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async removeMember(gymId: string, userId: string) {
    return this.prisma.gymMember.delete({
      where: {
        gymId_userId: {
          gymId,
          userId,
        },
      },
    });
  }

  // Class Management
  async createClass(gymId: string, createDto: CreateGymClassDto) {
    const gym = await this.prisma.gymProfile.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      throw new NotFoundException('Gym not found');
    }

    return this.prisma.gymClass.create({
      data: {
        gymId,
        ...createDto,
        scheduledAt: new Date(createDto.scheduledAt),
      },
      include: {
        workout: true,
        attendees: true,
      },
    });
  }

  async getClasses(gymId: string, startDate?: Date, endDate?: Date) {
    const where: any = { gymId };

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = startDate;
      if (endDate) where.scheduledAt.lte = endDate;
    }

    return this.prisma.gymClass.findMany({
      where,
      include: {
        workout: {
          include: {
            sections: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            sessionLog: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getClass(classId: string) {
    const gymClass = await this.prisma.gymClass.findUnique({
      where: { id: classId },
      include: {
        workout: {
          include: {
            sections: {
              include: {
                blocks: {
                  include: {
                    tierPrescriptions: true,
                  },
                },
              },
            },
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profile: true,
              },
            },
            sessionLog: true,
          },
        },
      },
    });

    if (!gymClass) {
      throw new NotFoundException('Class not found');
    }

    return gymClass;
  }

  async updateClass(classId: string, updateDto: Partial<CreateGymClassDto>) {
    return this.prisma.gymClass.update({
      where: { id: classId },
      data: {
        ...updateDto,
        scheduledAt: updateDto.scheduledAt ? new Date(updateDto.scheduledAt) : undefined,
      },
      include: {
        workout: true,
        attendees: true,
      },
    });
  }

  async deleteClass(classId: string) {
    return this.prisma.gymClass.delete({
      where: { id: classId },
    });
  }

  // Attendance Management
  async registerAttendance(classId: string, userId: string) {
    const gymClass = await this.prisma.gymClass.findUnique({
      where: { id: classId },
    });

    if (!gymClass) {
      throw new NotFoundException('Class not found');
    }

    return this.prisma.gymClassAttendance.upsert({
      where: {
        classId_userId: {
          classId,
          userId,
        },
      },
      update: {
        attended: true,
      },
      create: {
        classId,
        userId,
        attended: true,
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
  }

  async markAttendanceWithSession(classId: string, userId: string, sessionLogId: string) {
    return this.prisma.gymClassAttendance.update({
      where: {
        classId_userId: {
          classId,
          userId,
        },
      },
      data: {
        attended: true,
        sessionLogId,
      },
      include: {
        sessionLog: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
