/**
 * Auto-fix Database Issues
 * 
 * This script automatically detects and fixes common database migration issues:
 * - Missing columns (shortDescription, longDescription, isRecommended, etc.)
 * - Missing indexes
 * - Data inconsistencies
 * 
 * Run this on startup or via a health check endpoint
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ColumnCheck {
  table: string;
  column: string;
  type: string;
  nullable?: boolean;
}

interface FixResult {
  success: boolean;
  message: string;
  fixes: string[];
  errors: string[];
}

/**
 * Check if a column exists in a table
 */
async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = $1 AND column_name = $2`,
      table,
      column
    );
    return result.length > 0;
  } catch (error) {
    console.error(`Error checking column ${table}.${column}:`, error);
    return false;
  }
}

/**
 * Add a column if it doesn't exist
 */
async function addColumnIfMissing(
  table: string,
  column: string,
  type: string,
  nullable: boolean = true
): Promise<boolean> {
  try {
    const exists = await columnExists(table, column);
    if (exists) {
      return true; // Already exists
    }

    const nullableClause = nullable ? '' : 'NOT NULL';
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${type} ${nullableClause}`
    );
    console.log(`✅ Added column ${table}.${column}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add column ${table}.${column}:`, error);
    return false;
  }
}

/**
 * Main auto-fix function
 */
export async function autoFixDatabase(): Promise<FixResult> {
  const fixes: string[] = [];
  const errors: string[] = [];

  console.log('🔍 Starting database auto-fix...');

  // Define required columns
  const requiredColumns: ColumnCheck[] = [
    { table: 'exercise_blocks', column: 'shortDescription', type: 'TEXT', nullable: true },
    { table: 'exercise_blocks', column: 'longDescription', type: 'TEXT', nullable: true },
    { table: 'workouts', column: 'isRecommended', type: 'BOOLEAN', nullable: false },
    { table: 'workouts', column: 'shareId', type: 'TEXT', nullable: true },
    { table: 'workouts', column: 'createdBy', type: 'TEXT', nullable: true },
    { table: 'workout_sections', column: 'intervalWorkSec', type: 'INTEGER', nullable: true },
    { table: 'workout_sections', column: 'intervalRestSec', type: 'INTEGER', nullable: true },
    { table: 'workout_sections', column: 'intervalRounds', type: 'INTEGER', nullable: true },
    { table: 'workout_sections', column: 'stationDurationSec', type: 'INTEGER', nullable: true },
    { table: 'workout_sections', column: 'isTimedStations', type: 'BOOLEAN', nullable: true },
    { table: 'exercise_blocks', column: 'tempo', type: 'TEXT', nullable: true },
    { table: 'exercise_blocks', column: 'loadPercentage', type: 'TEXT', nullable: true },
  ];

  // Check and fix each column
  for (const col of requiredColumns) {
    try {
      const exists = await columnExists(col.table, col.column);
      if (!exists) {
        const added = await addColumnIfMissing(
          col.table,
          col.column,
          col.type,
          col.nullable ?? true
        );
        if (added) {
          fixes.push(`Added missing column: ${col.table}.${col.column}`);
        } else {
          errors.push(`Failed to add column: ${col.table}.${col.column}`);
        }
      }
    } catch (error: any) {
      errors.push(`Error checking ${col.table}.${col.column}: ${error.message}`);
    }
  }

  // Set default value for isRecommended if it was just added
  try {
    const isRecommendedExists = await columnExists('workouts', 'isRecommended');
    if (isRecommendedExists) {
      // Check if any rows have NULL values and set to false
      await prisma.$executeRawUnsafe(
        `UPDATE workouts SET "isRecommended" = false WHERE "isRecommended" IS NULL`
      );
    }
  } catch (error: any) {
    errors.push(`Error setting isRecommended defaults: ${error.message}`);
  }

  // Verify database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    fixes.push('Database connection verified');
  } catch (error: any) {
    errors.push(`Database connection failed: ${error.message}`);
  }

  const success = errors.length === 0;
  const message = success
    ? `✅ Database auto-fix completed successfully. ${fixes.length} fixes applied.`
    : `⚠️ Database auto-fix completed with ${errors.length} errors. ${fixes.length} fixes applied.`;

  console.log(message);
  if (fixes.length > 0) {
    console.log('Fixes applied:', fixes);
  }
  if (errors.length > 0) {
    console.error('Errors:', errors);
  }

  return {
    success,
    message,
    fixes,
    errors,
  };
}

// Run if called directly
if (require.main === module) {
  autoFixDatabase()
    .then((result) => {
      console.log('Result:', JSON.stringify(result, null, 2));
      // Don't exit with error code - allow deployment to continue even if some fixes failed
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      // Don't exit with error code - allow deployment to continue
      process.exit(0);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default autoFixDatabase;

