-- AlterTable: Add xp and level to users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'xp') THEN
        ALTER TABLE "users" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE "users" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

