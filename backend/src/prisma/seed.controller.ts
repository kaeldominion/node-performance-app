import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClerkAdminGuard } from '../auth/clerk-admin.guard';

@Controller('admin')
@UseGuards(ClerkAdminGuard) // Protect all admin endpoints with Clerk admin check
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

  @Post('delete/all-exercises')
  async deleteAllExercises() {
    try {
      // Delete all exercise tiers first (due to foreign key constraints)
      const tierCount = await this.prisma.exerciseTier.deleteMany({});
      
      // Delete all exercises
      const exerciseCount = await this.prisma.exercise.deleteMany({});
      
      return {
        success: true,
        message: `Deleted ${exerciseCount.count} exercises and ${tierCount.count} exercise tiers`,
        deletedExercises: exerciseCount.count,
        deletedTiers: tierCount.count,
      };
    } catch (error) {
      console.error('Error deleting exercises:', error);
      return {
        error: true,
        message: `Failed to delete exercises: ${error.message}`,
      };
    }
  }

  @Post('delete/all-programs')
  async deleteAllPrograms() {
    try {
      // Get all programs first to count them
      const programs = await this.prisma.program.findMany({
        select: { id: true, name: true },
      });
      
      // Delete all programs (cascading deletes will handle workouts, sections, blocks, etc.)
      const programCount = await this.prisma.program.deleteMany({});
      
      return {
        success: true,
        message: `Deleted ${programCount.count} programs and all associated workouts`,
        deletedPrograms: programCount.count,
        programNames: programs.map((p) => p.name),
      };
    } catch (error) {
      console.error('Error deleting programs:', error);
      return {
        error: true,
        message: `Failed to delete programs: ${error.message}`,
      };
    }
  }

  @Post('delete/all-legacy')
  async deleteAllLegacy() {
    try {
      // Delete exercises first
      const tierCount = await this.prisma.exerciseTier.deleteMany({});
      const exerciseCount = await this.prisma.exercise.deleteMany({});
      
      // Then delete programs
      const programs = await this.prisma.program.findMany({
        select: { id: true, name: true },
      });
      const programCount = await this.prisma.program.deleteMany({});
      
      return {
        success: true,
        message: 'Deleted all legacy exercises and programs',
        deletedExercises: exerciseCount.count,
        deletedTiers: tierCount.count,
        deletedPrograms: programCount.count,
        programNames: programs.map((p) => p.name),
      };
    } catch (error) {
      console.error('Error deleting legacy data:', error);
      return {
        error: true,
        message: `Failed to delete legacy data: ${error.message}`,
      };
    }
  }
}

