import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('admin')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Post('seed')
  async seed() {
    return this.prisma.seedDatabase();
  }

  @Post('seed/exercises')
  async seedExercises() {
    return this.prisma.seedExercises();
  }

  @Get('exercises/count')
  async getExerciseCount() {
    const count = await this.prisma.exercise.count();
    const sample = await this.prisma.exercise.findMany({
      take: 5,
      select: {
        exerciseId: true,
        name: true,
        movementPattern: true,
        space: true,
      },
    });
    return {
      total: count,
      sample,
    };
  }

  @Post('migrate')
  async runMigrations() {
    return this.prisma.runMigrations();
  }

  @Post('migrate/resolve')
  async resolveMigration(
    @Body() body: { migrationName: string; action?: 'applied' | 'rolled_back' }
  ) {
    const { migrationName, action = 'applied' } = body;
    if (!migrationName) {
      return { error: true, message: 'migrationName is required in request body' };
    }
    return this.prisma.resolveMigration(migrationName, action);
  }
}

