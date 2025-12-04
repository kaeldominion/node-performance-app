import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateTemplateDto) {
    return this.prisma.workoutTemplate.create({
      data: {
        ...createDto,
        createdBy: userId,
      },
      include: {
        workouts: true,
      },
    });
  }

  async findAll(includePublic: boolean = true, userId?: string) {
    const where: any = {};

    if (includePublic) {
      where.OR = [
        { isPublic: true },
        ...(userId ? [{ createdBy: userId }] : []),
      ];
    } else if (userId) {
      where.createdBy = userId;
    }

    return this.prisma.workoutTemplate.findMany({
      where,
      include: {
        workouts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByArchetype(archetype: string) {
    return this.prisma.workoutTemplate.findMany({
      where: {
        archetype: archetype as any,
        isPublic: true,
      },
      include: {
        workouts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        workouts: {
          include: {
            sections: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, userId: string, updateDto: Partial<CreateTemplateDto>) {
    const template = await this.prisma.workoutTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Only creator or admin can update
    if (template.createdBy !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || (user.role !== 'SUPERADMIN' && !user.isAdmin)) {
        throw new NotFoundException('Template not found or access denied');
      }
    }

    return this.prisma.workoutTemplate.update({
      where: { id },
      data: updateDto,
      include: {
        workouts: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const template = await this.prisma.workoutTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Only creator or admin can delete
    if (template.createdBy !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || (user.role !== 'SUPERADMIN' && !user.isAdmin)) {
        throw new NotFoundException('Template not found or access denied');
      }
    }

    return this.prisma.workoutTemplate.delete({
      where: { id },
    });
  }

  // Get system templates (created by system, not users)
  async getSystemTemplates() {
    return this.prisma.workoutTemplate.findMany({
      where: {
        createdBy: null,
        isPublic: true,
      },
      include: {
        workouts: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { archetype: 'asc' },
    });
  }
}
