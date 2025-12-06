import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoachesService } from './coaches.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CoachesSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CoachesSchedulerService.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private coachesService: CoachesService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    // Schedule weekly summaries every Monday at 9 AM
    this.scheduleWeeklySummaries();
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private scheduleWeeklySummaries() {
    // Calculate milliseconds until next Monday at 9 AM
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(9, 0, 0, 0);
    
    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const msUntilNextMonday = nextMonday.getTime() - now.getTime();

    // Schedule first run
    setTimeout(() => {
      this.sendWeeklySummaries();
      // Then run every week (7 days)
      this.intervalId = setInterval(() => {
        this.sendWeeklySummaries();
      }, 7 * 24 * 60 * 60 * 1000);
    }, msUntilNextMonday);

    this.logger.log(`Weekly summaries scheduled. Next run: ${nextMonday.toISOString()}`);
  }

  async sendWeeklySummaries() {
    this.logger.log('Starting weekly summary job...');

    try {
      // Get all active coaches
      const coaches = await this.prisma.user.findMany({
        where: {
          role: 'COACH',
          coachProfile: {
            isActive: true,
          },
        },
        include: {
          coachProfile: true,
        },
      });

      this.logger.log(`Found ${coaches.length} active coaches`);

      for (const coach of coaches) {
        try {
          // Generate summary
          const summary = await this.coachesService.generateWeeklySummary(coach.id);

          // Send email
          await this.emailService.sendWeeklyCoachSummary(coach.id, summary);

          this.logger.log(`Sent weekly summary to coach ${coach.id}`);

          // Optionally send summaries to clients
          const clients = await this.prisma.coachClient.findMany({
            where: {
              coachId: coach.id,
              status: 'ACTIVE',
            },
            include: {
              client: true,
            },
          });

          for (const clientRelation of clients) {
            try {
              const clientSummary = await this.generateClientWeeklySummary(
                clientRelation.clientId,
                coach.id,
              );
              await this.emailService.sendWeeklyClientSummary(
                clientRelation.clientId,
                coach.id,
                clientSummary,
              );
            } catch (error) {
              this.logger.error(
                `Failed to send client summary to ${clientRelation.clientId}:`,
                error,
              );
            }
          }
        } catch (error) {
          this.logger.error(`Failed to process coach ${coach.id}:`, error);
        }
      }

      this.logger.log('Weekly summary job completed');
    } catch (error) {
      this.logger.error('Weekly summary job failed:', error);
    }
  }

  private async generateClientWeeklySummary(clientId: string, coachId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const now = new Date();

    // Get sessions this week
    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        userId: clientId,
        completed: true,
        completedAt: {
          gte: weekAgo,
        },
      },
      include: {
        workout: {
          select: {
            name: true,
          },
        },
      },
    });

    const totalDuration = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
    const avgRPE =
      sessions.filter((s) => s.rpe).length > 0
        ? sessions
            .filter((s) => s.rpe)
            .reduce((sum, s) => sum + (s.rpe || 0), 0) /
          sessions.filter((s) => s.rpe).length
        : null;

    return {
      sessionsCompleted: sessions.length,
      totalDuration: Math.round(totalDuration / 60), // minutes
      avgRPE: avgRPE ? avgRPE.toFixed(1) : null,
      workouts: sessions.map((s) => s.workout.name),
    };
  }
}
