-- AlterEnum: Add CORE_FLEXION to MovementPattern
ALTER TYPE "MovementPattern" ADD VALUE IF NOT EXISTS 'CORE_FLEXION';

-- AlterEnum: Add MACHINE_FIXED to SpaceRequirement  
ALTER TYPE "SpaceRequirement" ADD VALUE IF NOT EXISTS 'MACHINE_FIXED';
