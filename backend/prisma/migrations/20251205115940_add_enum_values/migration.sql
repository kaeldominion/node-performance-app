-- AlterEnum: Add CORE_FLEXION to MovementPattern
-- Note: ALTER TYPE ADD VALUE cannot be rolled back, so we check if it exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CORE_FLEXION' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MovementPattern')
    ) THEN
        ALTER TYPE "MovementPattern" ADD VALUE 'CORE_FLEXION';
    END IF;
END $$;

-- AlterEnum: Add MACHINE_FIXED to SpaceRequirement
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MACHINE_FIXED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SpaceRequirement')
    ) THEN
        ALTER TYPE "SpaceRequirement" ADD VALUE 'MACHINE_FIXED';
    END IF;
END $$;
