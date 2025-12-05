import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Infer exercise category from exercise name
 */
function inferCategoryFromName(exerciseName: string): 'STRENGTH' | 'MIXED' | 'SKILL' | 'ENGINE' | 'CORE' | 'MOBILITY' {
  const name = exerciseName.toLowerCase();
  
  // ENGINE: Cardio/conditioning exercises
  if (name.includes('run') || name.includes('jog') || name.includes('sprint') || 
      name.includes('row') && (name.includes('erg') || name.includes('machine')) ||
      name.includes('bike') && (name.includes('erg') || name.includes('assault') || name.includes('echo')) ||
      name.includes('ski') && name.includes('erg') ||
      name.includes('shuttle') || name.includes('burpee') ||
      name.includes('jump rope') || name.includes('double under') || name.includes('single under')) {
    return 'ENGINE';
  }
  
  // SKILL: Technical movements
  if (name.includes('snatch') || name.includes('clean') || name.includes('jerk') ||
      name.includes('muscle up') || name.includes('handstand') || name.includes('kip') ||
      name.includes('double under') || name.includes('turkish getup') || name.includes('tgu')) {
    return 'SKILL';
  }
  
  // CORE: Core-specific exercises
  if (name.includes('plank') || name.includes('hollow') || name.includes('dead bug') ||
      name.includes('pallof') || name.includes('russian twist') || name.includes('situp') ||
      name.includes('crunch') || name.includes('leg raise') || name.includes('knees to chest') ||
      name.includes('ttb') || name.includes('toes to bar') || name.includes('ghd situp')) {
    return 'CORE';
  }
  
  // MOBILITY: Mobility/flexibility exercises
  if (name.includes('stretch') || name.includes('mobility') || name.includes('cossack') ||
      name.includes('worlds greatest') || name.includes('inchworm') || name.includes('frog squat')) {
    return 'MOBILITY';
  }
  
  // MIXED: Hybrid exercises that combine strength and conditioning
  if (name.includes('thruster') || name.includes('wall ball') || name.includes('sandbag') ||
      name.includes('sled') || name.includes('carry') || name.includes('bear crawl') ||
      name.includes('push press') || name.includes('kettlebell swing')) {
    return 'MIXED';
  }
  
  // Default to STRENGTH for most other exercises
  return 'STRENGTH';
}

/**
 * Infer movement pattern from exercise name
 */
function inferMovementPatternFromName(exerciseName: string): 'HORIZONTAL_PUSH' | 'HORIZONTAL_PULL' | 'VERTICAL_PUSH' | 'VERTICAL_PULL' | 'SQUAT' | 'HINGE' | 'LUNGE' | 'CARRY' | 'LOC0MOTION' | 'FULL_BODY' | 'CORE_ANTI_EXTENSION' | 'CORE_ROTATION' | 'BREATH_MOBILITY' {
  const name = exerciseName.toLowerCase();
  
  // HORIZONTAL_PUSH: Bench press, push-ups, dips (horizontal)
  if (name.includes('bench') || name.includes('push up') || name.includes('pushup') ||
      name.includes('floor press') || name.includes('chest press') || name.includes('fly')) {
    return 'HORIZONTAL_PUSH';
  }
  
  // HORIZONTAL_PULL: Rows, face pulls
  if (name.includes('row') && !name.includes('erg') && !name.includes('machine') ||
      name.includes('face pull') || name.includes('cable row')) {
    return 'HORIZONTAL_PULL';
  }
  
  // VERTICAL_PUSH: Overhead press, push press, strict press
  if (name.includes('press') && (name.includes('overhead') || name.includes('ohp') || name.includes('strict') || name.includes('push press'))) {
    return 'VERTICAL_PUSH';
  }
  
  // VERTICAL_PULL: Pull-ups, lat pulldowns, chin-ups
  if (name.includes('pull up') || name.includes('pullup') || name.includes('chin up') ||
      name.includes('lat pull') || name.includes('pulldown') || name.includes('ski erg')) {
    return 'VERTICAL_PULL';
  }
  
  // SQUAT: All squat variations
  if (name.includes('squat') || name.includes('wall ball') || name.includes('thruster') ||
      name.includes('goblet') || name.includes('front squat') || name.includes('back squat')) {
    return 'SQUAT';
  }
  
  // HINGE: Deadlifts, RDLs, good mornings, swings
  if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian') ||
      name.includes('good morning') || name.includes('swing') || name.includes('hip thrust') ||
      name.includes('ghd back extension')) {
    return 'HINGE';
  }
  
  // LUNGE: All lunge variations
  if (name.includes('lunge') || name.includes('step up') || name.includes('step-up') ||
      name.includes('split squat') || name.includes('bulgarian')) {
    return 'LUNGE';
  }
  
  // CARRY: Carrying exercises
  if (name.includes('carry') || name.includes('farmer') || name.includes('walk')) {
    return 'CARRY';
  }
  
  // LOC0MOTION: Running, crawling, locomotion
  if (name.includes('run') || name.includes('jog') || name.includes('sprint') ||
      name.includes('crawl') || name.includes('shuttle') || name.includes('row') && name.includes('erg') ||
      name.includes('bike') && (name.includes('erg') || name.includes('assault') || name.includes('echo'))) {
    return 'LOC0MOTION';
  }
  
  // CORE_ANTI_EXTENSION: Planks, dead bugs, hollow holds
  if (name.includes('plank') || name.includes('dead bug') || name.includes('hollow') ||
      name.includes('bear hold') || name.includes('bear crawl')) {
    return 'CORE_ANTI_EXTENSION';
  }
  
  // CORE_ROTATION: Russian twists, pallof presses
  if (name.includes('russian twist') || name.includes('pallof') || name.includes('side plank')) {
    return 'CORE_ROTATION';
  }
  
  // BREATH_MOBILITY: Mobility/breathing exercises
  if (name.includes('stretch') || name.includes('mobility') || name.includes('breath') ||
      name.includes('worlds greatest') || name.includes('cossack')) {
    return 'BREATH_MOBILITY';
  }
  
  // FULL_BODY: Complex movements that use multiple patterns
  if (name.includes('burpee') || name.includes('thruster') || name.includes('turkish getup') ||
      name.includes('tgu') || name.includes('muscle up') || name.includes('clean') ||
      name.includes('snatch') || name.includes('wall ball')) {
    return 'FULL_BODY';
  }
  
  // Default fallback
  return 'FULL_BODY';
}

/**
 * Infer equipment from exercise name
 */
function inferEquipmentFromName(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase();
  const equipment: string[] = [];
  
  // Equipment patterns
  if (name.includes('bb ') || name.includes('barbell') || name.includes('bar ')) {
    equipment.push('barbell');
    equipment.push('plates');
  }
  if (name.includes('db ') || name.includes('dumbbell')) {
    equipment.push('dumbbell');
  }
  if (name.includes('kb ') || name.includes('kettlebell')) {
    equipment.push('kettlebell');
  }
  if (name.includes('bench') || name.includes('incline') || name.includes('decline')) {
    if (!equipment.includes('bench')) equipment.push('bench');
  }
  if (name.includes('row') && (name.includes('erg') || name.includes('machine'))) {
    equipment.push('rower');
  }
  if (name.includes('bike') && (name.includes('erg') || name.includes('assault') || name.includes('echo'))) {
    equipment.push('air_bike');
  }
  if (name.includes('ski') && name.includes('erg')) {
    equipment.push('ski_erg');
  }
  if (name.includes('sled')) {
    equipment.push('sled');
  }
  if (name.includes('wall ball') || name.includes('wallball')) {
    equipment.push('wall_ball');
  }
  if (name.includes('sandbag')) {
    equipment.push('sandbag');
  }
  if (name.includes('farmers') || name.includes('farmer')) {
    equipment.push('dumbbell');
  }
  if (name.includes('pull') && (name.includes('up') || name.includes('down'))) {
    equipment.push('rig');
  }
  if (name.includes('dip')) {
    equipment.push('rig');
  }
  if (name.includes('ghd') || name.includes('glute ham')) {
    equipment.push('ghd');
  }
  if (name.includes('squat') && (name.includes('rack') || name.includes('bb ') || name.includes('barbell'))) {
    if (!equipment.includes('rack')) equipment.push('rack');
  }
  
  return equipment;
}

async function main() {
  console.log('🔧 Starting exercise classification fix...\n');
  
  const exercises = await prisma.exercise.findMany();
  console.log(`Found ${exercises.length} exercises to process\n`);
  
  let fixedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ exerciseId: string; name: string; error: string }> = [];
  
  for (const exercise of exercises) {
    try {
      const inferredCategory = inferCategoryFromName(exercise.name);
      const inferredPattern = inferMovementPatternFromName(exercise.name);
      const inferredEquipment = inferEquipmentFromName(exercise.name);
      
      // Check if exercise needs updating
      const needsUpdate = 
        exercise.category !== inferredCategory ||
        exercise.movementPattern !== inferredPattern ||
        (inferredEquipment.length > 0 && JSON.stringify(exercise.equipment.sort()) !== JSON.stringify(inferredEquipment.sort()));
      
      if (needsUpdate) {
        const updateData: any = {};
        
        if (exercise.category !== inferredCategory) {
          updateData.category = inferredCategory;
          console.log(`  📝 ${exercise.name}: Category ${exercise.category} → ${inferredCategory}`);
        }
        
        if (exercise.movementPattern !== inferredPattern) {
          updateData.movementPattern = inferredPattern;
          console.log(`  📝 ${exercise.name}: Pattern ${exercise.movementPattern} → ${inferredPattern}`);
        }
        
        if (inferredEquipment.length > 0 && JSON.stringify(exercise.equipment.sort()) !== JSON.stringify(inferredEquipment.sort())) {
          // Only update equipment if we inferred something and it's different
          // Don't overwrite if exercise already has correct equipment
          const currentEq = exercise.equipment.map(e => e.toLowerCase()).sort();
          const inferredEq = inferredEquipment.map(e => e.toLowerCase()).sort();
          
          // Check if current equipment is wrong (e.g., just "bodyweight" when it should have equipment)
          if (currentEq.length === 0 && inferredEq.length > 0) {
            updateData.equipment = inferredEquipment;
            console.log(`  📝 ${exercise.name}: Equipment [] → [${inferredEquipment.join(', ')}]`);
          } else if (currentEq.includes('bodyweight') && inferredEq.length > 0) {
            // If it says bodyweight but should have equipment, update it
            updateData.equipment = inferredEquipment;
            console.log(`  📝 ${exercise.name}: Equipment [bodyweight] → [${inferredEquipment.join(', ')}]`);
          }
        }
        
        if (Object.keys(updateData).length > 0) {
          await prisma.exercise.update({
            where: { id: exercise.id },
            data: updateData,
          });
          fixedCount++;
          console.log(`  ✅ Fixed: ${exercise.name}\n`);
        }
      } else {
        skippedCount++;
        console.log(`  ✓ ${exercise.name}: Already correct (${exercise.category}, ${exercise.movementPattern})\n`);
      }
    } catch (error: any) {
      errors.push({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        error: error.message || String(error),
      });
      console.error(`  ❌ Error fixing ${exercise.name}: ${error.message}\n`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`  ✅ Fixed: ${fixedCount} exercises`);
  console.log(`  ✓ Skipped (already correct): ${skippedCount} exercises`);
  console.log(`  ❌ Errors: ${errors.length} exercises`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ exerciseId, name, error }) => {
      console.log(`  - ${name} (${exerciseId}): ${error}`);
    });
  }
  
  console.log('\n✨ Exercise classification fix complete!');
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

