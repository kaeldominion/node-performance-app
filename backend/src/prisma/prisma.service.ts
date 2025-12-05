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
        // Add INTERVAL enum value if it doesn't exist - use proper case-sensitive reference
        await this.$executeRawUnsafe(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_enum e
              JOIN pg_type t ON e.enumtypid = t.oid
              WHERE t.typname = 'SectionType' AND e.enumlabel = 'INTERVAL'
            ) THEN
              ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'INTERVAL';
            END IF;
          END $$;
        `);
        
        // Ensure interval fields exist
        await this.$executeRawUnsafe(`
          ALTER TABLE "workout_sections" 
          ADD COLUMN IF NOT EXISTS "intervalWorkSec" INTEGER,
          ADD COLUMN IF NOT EXISTS "intervalRestSec" INTEGER,
          ADD COLUMN IF NOT EXISTS "intervalRounds" INTEGER;
        `);
        
        // Mark migration as applied using Prisma's migration table
        await this.$executeRawUnsafe(`
          UPDATE "_prisma_migrations" 
          SET finished_at = NOW(), 
              applied_steps_count = 1
          WHERE migration_name = $1 
            AND finished_at IS NULL;
        `, migrationName);
      } else {
        // Mark as rolled back
        await this.$executeRawUnsafe(`
          UPDATE "_prisma_migrations" 
          SET rolled_back_at = NOW()
          WHERE migration_name = $1;
        `, migrationName);
      }
      
      return { message: `Migration ${migrationName} marked as ${action}` };
    } catch (error: any) {
      // If enum check fails, try simpler approach - just mark as applied
      if (action === 'applied' && error.message?.includes('type')) {
        try {
          // Just mark the migration as applied without checking enum
          await this.$executeRawUnsafe(`
            UPDATE "_prisma_migrations" 
            SET finished_at = NOW(), 
                applied_steps_count = 1
            WHERE migration_name = $1 
              AND finished_at IS NULL;
          `, migrationName);
          
          return { 
            message: `Migration ${migrationName} marked as applied (skipped enum check)`,
            warning: 'Enum check failed, but migration marked as applied. Please verify database state.'
          };
        } catch (innerError: any) {
          return { 
            error: true, 
            message: `Failed to resolve migration: ${innerError.message}`,
            details: innerError.stack || ''
          };
        }
      }
      
      return { 
        error: true, 
        message: `Failed to resolve migration: ${error.message}`,
        details: error.stack || ''
      };
    }
  }
}

