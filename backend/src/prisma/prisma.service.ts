import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    // Prisma 7: For now, use empty constructor - connection handled via env
    // Note: This may require prisma.config.ts for migrations
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async seedDatabase() {
    try {
      // Check if any programs exist
      const programCount = await this.program.count();
      
      if (programCount > 0) {
        return { message: `Database already has ${programCount} program(s)`, skipped: true };
      }

      // Run seed using npm script (requires ts-node in production)
      const { execSync } = require('child_process');
      
      execSync('npm run prisma:seed', { 
        stdio: 'pipe',
        env: process.env,
        cwd: process.cwd()
      });
      
      const newCount = await this.program.count();
      return { message: `Database seeded successfully with ${newCount} program(s)`, skipped: false };
    } catch (error) {
      // Return error message instead of throwing
      return { 
        error: true, 
        message: `Seed failed: ${error.message}`,
        details: error.stdout?.toString() || error.stderr?.toString() || ''
      };
    }
  }
}

