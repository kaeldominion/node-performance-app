import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string | null, createFeedbackDto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        userId: userId || null,
        type: createFeedbackDto.type,
        title: createFeedbackDto.title,
        description: createFeedbackDto.description,
        category: createFeedbackDto.category,
        pageUrl: createFeedbackDto.pageUrl,
        userAgent: createFeedbackDto.userAgent,
        metadata: createFeedbackDto.metadata || {},
        status: 'NEW',
      },
    });
  }

  async findAll(filters?: {
    type?: string;
    status?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.userId) {
      where.userId = filters.userId;
    }

    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return {
      items,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  async findOne(id: string) {
    return this.prisma.feedback.findUnique({
      where: { id },
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

  async updateStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string) {
    return this.prisma.feedback.update({
      where: { id },
      data: {
        status: status as any,
        adminNotes,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }
}

