import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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

  async seedExercises() {
    try {
      // Run seed using npm script (requires ts-node in production)
      const { execSync } = require('child_process');
      
      execSync('npm run prisma:seed:exercises', { 
        stdio: 'pipe',
        env: process.env,
        cwd: process.cwd()
      });
      
      const total = await this.exercise.count();
      return { 
        message: `Exercises seeded successfully. Total: ${total} exercises`,
        total
      };
    } catch (error: any) {
      // Return error message instead of throwing
      return { 
        error: true, 
        message: `Exercise seeding failed: ${error.message}`,
        details: error.stdout?.toString() || error.stderr?.toString() || error.stack || ''
      };
    }
  }
}

