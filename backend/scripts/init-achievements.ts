import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENT_DEFINITIONS } from '../src/gamification/achievements.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initializing achievements in database...');
  console.log(`Found ${ACHIEVEMENT_DEFINITIONS.length} achievement definitions\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    try {
      await prisma.achievement.upsert({
        where: { code: def.code },
        update: {
          name: def.name,
          description: def.description,
          category: def.category,
          icon: def.icon,
          rarity: def.rarity,
          xpReward: def.xpReward,
        },
        create: {
          code: def.code,
          name: def.name,
          description: def.description,
          category: def.category,
          icon: def.icon,
          rarity: def.rarity,
          xpReward: def.xpReward,
        },
      });
      successCount++;
      console.log(`✓ ${def.code} - ${def.name}`);
    } catch (error: any) {
      errorCount++;
      console.error(`✗ ${def.code}:`, error.message);
    }
  }
  
  const totalCount = await prisma.achievement.count();
  console.log(`\n✅ Initialization complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total in database: ${totalCount}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
