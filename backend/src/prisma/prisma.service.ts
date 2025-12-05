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

  async runMigrations() {
    try {
      const { execSync } = require('child_process');
      
      execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        env: process.env,
        cwd: process.cwd()
      });
      
      return { 
        message: 'Migrations applied successfully',
        success: true
      };
    } catch (error: any) {
      return { 
        error: true, 
        message: `Migration failed: ${error.message}`,
        details: error.stdout?.toString() || error.stderr?.toString() || error.stack || ''
      };
    }
  }

  async resolveMigration(migrationName: string, action: 'applied' | 'rolled_back') {
    try {
      // Directly update the _prisma_migrations table
      if (action === 'applied') {
        // First, ensure the migration changes are actually applied
        // Check if INTERVAL enum exists
        const enumCheck = await this.$queryRaw`
          SELECT 1 FROM pg_enum 
          WHERE enumtypid = 'SectionType'::regtype 
          AND enumlabel = 'INTERVAL'
        `;
        
        if (!enumCheck || (Array.isArray(enumCheck) && enumCheck.length === 0)) {
          // Add INTERVAL enum value
          await this.$executeRaw`
            DO $$ 
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'SectionType'::regtype AND enumlabel = 'INTERVAL') THEN
                ALTER TYPE "SectionType" ADD VALUE 'INTERVAL';
              END IF;
            END $$;
          `;
        }
        
        // Ensure interval fields exist
        await this.$executeRaw`
          ALTER TABLE "workout_sections" 
          ADD COLUMN IF NOT EXISTS "intervalWorkSec" INTEGER,
          ADD COLUMN IF NOT EXISTS "intervalRestSec" INTEGER,
          ADD COLUMN IF NOT EXISTS "intervalRounds" INTEGER;
        `;
        
        // Mark migration as applied
        await this.$executeRaw`
          UPDATE "_prisma_migrations" 
          SET finished_at = NOW(), 
              applied_steps_count = 1
          WHERE migration_name = ${migrationName} 
            AND finished_at IS NULL;
        `;
      } else {
        // Mark as rolled back
        await this.$executeRaw`
          UPDATE "_prisma_migrations" 
          SET rolled_back_at = NOW()
          WHERE migration_name = ${migrationName};
        `;
      }
      
      return { message: `Migration ${migrationName} marked as ${action}` };
    } catch (error: any) {
      return { 
        error: true, 
        message: `Failed to resolve migration: ${error.message}`,
        details: error.stack || ''
      };
    }
  }
}

